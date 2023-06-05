/**
 * @file Handles storage and operation of 4D mesh geometry.
 */

import type {Vector4, Bivector4} from "./vector";
import {numberArrayKey} from "../util";

export type Vert = Vector4;
export type Edge = [Vert, Vert];
export type EdgeLoop = [Vert, Edge];
export type Face = EdgeLoop[];
export type FaceLoop = [Edge, Face];
export type Cell = Face[];

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

	/**
	 * 
	 * @param verts List of vertices.
	 * @param facesByVertIndexes List of number tuples, where each number is an index of a vertex in `verts`.
	 * @param cellsByFaceIndexes List of number tuples, where each number is an index of a face in `facesByVertIndexes`.
	 * @returns A mesh that satisfies the specified parameters.
	 */
	static fromVertsFacesCells(
		verts: Vert[],
		facesByVertIndexes: number[][],
		cellsByFaceIndexes: number[][]=[],
	): Mesh4 {
		const edgeSet = new Map<ReturnType<typeof numberArrayKey>, Edge>();
		const edgeLoopSet = new Map<ReturnType<typeof numberArrayKey>, EdgeLoop[]>();

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