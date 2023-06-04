/**
 * @file Handles storage and operation of 4D mesh geometry.
 */

import type {Vector4, Bivector4} from "./vector";

type Vert = Vector4;
type Edge = [Vert, Vert];
type EdgeLoop = [Vert, Edge];
type Face = EdgeLoop[];
type FaceLoop = [Edge, Face];
type Cell = Face[];

/**
 * Stores a set of 4D points and how they are connected. Used to define a 4D polygon mesh.
 */
export class Mesh4 {
	private constructor(
		readonly verts: Vert[]=[],
		readonly edges: Edge[]=[],
		readonly faces: Face[]=[],
		readonly cells: Cell[]=[],

		/**
		 * Tuples containing each edge and one of its incident vertices.
		 * ```assert(this.edgeLoops.length === 2 × this.edges.length)```
		 */
		readonly edgeLoops: EdgeLoop[]=[],
	) {}

	static fromVertsFacesCells(
		verts: Vert[],
		facesByVertIndexes: number[][],
		cellsByFaceIndexes: number[][]=[],
	): Mesh4 {
		const edgeSet: Map<BigInt, Edge> = new Map();
		const edgeLoopSet: Map<BigInt, EdgeLoop[]> = new Map();

		const faces: Face[] = [];

		// Find edges from the faces specified
		for (const vertIndexes of facesByVertIndexes) {
			const face: Face = [];
			for (let i = 0; i < vertIndexes.length; i++) {
				const vertIndex0 = vertIndexes[i];
				const vertIndex1 = vertIndexes[(i + 1) % vertIndexes.length];

				const vert0 = verts[vertIndex0];
				const vert1 = verts[vertIndex1];

				const key = numberArrayKey([vertIndex0, vertIndex1]);

				// Select the edge loop that has `vert0` as its vertex
				let edgeLoop: EdgeLoop;

				if (!edgeSet.has(key)) {
					const edge: Edge = [vert0, vert1];
					edgeSet.set(key, edge);

					const edgeLoop0: EdgeLoop = [vert0, edge];
					const edgeLoop1: EdgeLoop = [vert1, edge];
					edgeLoopSet.set(key, [
						edgeLoop0,
						edgeLoop1,
					]);

					edgeLoop = edgeLoop0;
				} else {
					const edgeLoops = edgeLoopSet.get(key)!;
					edgeLoop = edgeLoops[0][0] === vert0
							? edgeLoops[0]
							: edgeLoops[1];
				}

				face.push(edgeLoop);
			}
			faces.push(face);
		}

		// Replace face indexes in cell list with references
		const cells: Cell[] = cellsByFaceIndexes.map(
			faceIndexes => faceIndexes.map(index => faces[index])
		);

		return new Mesh4(
			verts,
			[...edgeSet.values()],
			faces,
			cells,
			[...edgeLoopSet.values()].flat(),
		);
	}

	// for testing
	/* static fromVertsFaces(
		verts: Vert[],
		facesByVertIndexes: number[][],
	) {
		return {
			triangleCoords() {
				const coords: number[] = [];
				for (const vertIndexes of facesByVertIndexes) {
					for (let i = 1; i < vertIndexes.length - 1; i++) {
						// Select vertices to create a triangle fan
						coords.push(
							...verts[vertIndexes[0]],
							...verts[vertIndexes[i]],
							...verts[vertIndexes[i + 1]],
						);
					}
				}
				return coords;
			},
		};
	} */

	triangleCoords(): number[] {
		const coords: number[] = [];
		for (const edgeLoops of this.faces) {
			for (let i = 1; i < edgeLoops.length - 1; i++) {
				// Select vertices to create a triangle fan
				coords.push(
					...edgeLoops[0][0],
					...edgeLoops[i][0],
					...edgeLoops[i + 1][0],
				);
			}
		}
		return coords;
	}

	linesCoords(): number[] {
		const coords: number[] = [];
		for (const edge of this.edges) {
			coords.push(
				...edge[0],
				...edge[1],
			);
		}
		return coords;
	}
}

/**
 * 
 * @param {Mesh4} geometry 
 * @param {number[]} vertIndexes 
 * @returns {Bivector4} 
 */
const bivectorFromTri = (geometry: Mesh4, vertIndexes: number[]): Bivector4 => {
	const dir0 = geometry.verts[vertIndexes[1]].subtract(geometry.verts[vertIndexes[0]]);
	const dir1 = geometry.verts[vertIndexes[2]].subtract(geometry.verts[vertIndexes[0]]);

	return dir0.outer(dir1);
}

/**
 * Sorts an array of vertex indices and represents it as a BigInt. The return value is used to distinguish it in a
 * set or map, similar to a hash code.
 * @param {number[]} vertIndexes 
 * @returns {bigint}
 */
const numberArrayKey = (vertIndexes: number[]): bigint => {
	const bitsPerComponent = 32n; // arbitrary; can practically be at most 53n (max safe integer for doubles)

	// Sort the array so that facets with the same vertices, but not in the same direction, are no longer distinguished
	const vertIndexesClone = vertIndexes.slice().sort((a, b) => a - b);

	let primitive = BigInt(vertIndexesClone[0]);
	for (let i = 1; i < vertIndexesClone.length; i++) {
		primitive <<= bitsPerComponent;
		primitive += (BigInt(vertIndexesClone[i]) + 1n) % bitsPerComponent; // Add 1 so different-length lists are not considered equal
	}
	
	return primitive;
}