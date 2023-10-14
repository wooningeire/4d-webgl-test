/**
 * @file Handles storage and operation of 4D mesh geometry.
 */

import {reorderEdges, loops} from "./mesh_util";
import type {Edge, Face, Cell, Vert, EdgeLoop} from "./mesh_util";
import {crossSect} from "./mesh_crosssection";
import {Vector4, Bivector4, Space3_4} from "./vector";
import type {Transform4} from "./Transform4";
import {numberSetKey} from "../util";

/**
 * Stores a set of 4D points and how they are connected. Used to define a 4D polygon mesh.
 */
export class Mesh4 {
	private constructor(
		readonly verts: Vert[]=[],
		readonly edges: Edge[]=[],
		/** **Ordered** list of edge loops. */
		readonly faces: Face[]=[],
		readonly cells: Cell[]=[],

		/**
		 * Tuples containing one edge and one of its incident vertices. Essentially function as oriented edges.
		 * ```assert(this.edgeLoops.length === 2 × this.edges.length)```
		 */
		readonly edgeLoops: EdgeLoop[]=[],
	) {}

	/**
	 * Generates a mesh from a list of vertices, faces (defined by lists of indices of those vertices), and cells
	 * (defined by lists of indices of those faces).
	 * @param verts List of vertices.
	 * @param facesByVertIndices List of number tuples, where each number is an index of a vertex in `verts`.
	 * @param cellsByFaceIndices List of number tuples, where each number is an index of a face in `facesByVertIndices`.
	 * @returns A mesh that satisfies the specified parameters.
	 */
	static fromVertsFacesCells(
		verts: Vert[],
		facesByVertIndices: number[][],
		cellsByFaceIndices: number[][]=[],
	): Mesh4 {
		const edgeSet = new Map<ReturnType<typeof numberSetKey>, Edge>();
		const edgeLoopSet = new Map<ReturnType<typeof numberSetKey>, EdgeLoop[]>();

		const faces: Face[] = [];

		// Find edges from the faces specified
		for (const vertIndices of facesByVertIndices) {
			const face: Face = [];
			for (let i = 0; i < vertIndices.length; i++) {
				const vertIndex0 = vertIndices[i];
				const vertIndex1 = vertIndices[(i + 1) % vertIndices.length];

				const vert0 = verts[vertIndex0];
				const vert1 = verts[vertIndex1];

				const key = numberSetKey([vertIndex0, vertIndex1]);

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

		// Replace face indices in cell list with references
		const cells: Cell[] = cellsByFaceIndices.map(
			faceIndices => faceIndices.map(index => faces[index])
		);

		return new Mesh4(
			verts,
			[...edgeSet.values()],
			faces,
			cells,
			[...edgeLoopSet.values()].flat(),
		);
	}

	triangleCoords(): number[] {
		const coords: number[] = [];
		// Assuming convex faces
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

	/** temporary implementation */
	triangleColors(): number[] {
		const channels: number[] = [];
		// Assuming convex faces
		for (const edgeLoops of this.faces) {
			// const color = [
			// 	Math.random() * 0.4 + 0.6,
			// 	Math.random() * 0.4 + 0.6,
			// 	Math.random() * 0.4 + 0.6,
			// 	0.5,
			// ];

			const bivector = edgeLoops[2][0].subtract(edgeLoops[1][0])
					.outer(edgeLoops[0][0].subtract(edgeLoops[1][0]))
					.normalized();

			const color = [
				Math.abs(bivector.yz),
				Math.abs(bivector.xz),
				Math.abs(bivector.xy),
				0.5,
			];

			for (let i = 1; i < edgeLoops.length - 1; i++) {
				channels.push(
					...color,
					...color,
					...color,
				);
			}
		}
		return channels;
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

	/**
	 * Constructs the dual of this mesh.
	 * - Each original cell corresponds to a vertex at its centroid.
	 * - Each original face (bounded by 2 original cells) corresponds to an edge that connects the vertices from the
	 * 			2 original bounding cells.
	 * - Each original edge (bounded by multiple original cells) corresponds to a face that connects the vertices
	 * 			from the original bounding cells.
	 * - Each original vertex (bounded by multiple original cells) corresponds to a cell that connects the vertices
	 * 			from the original bounding cells.
	 * @returns The dual of this mesh.
	 */
	dual(): Mesh4 {
		const cellIndices = new Map<Cell, number>(
			this.cells.map((cell, i) => [cell, i])
		);
		const faceIndices = new Map<Face, number>();
		const edgeIndices = new Map<Edge, number>();
		
		// A `Mesh4` object is stored such that edges reference vertices, faces reference edges, and cells reference
		// faces. Here we reverse those relationships to generate the dual

		const boundingCellsOfFaces = new Map<Face, Cell[]>();
		for (const cell of this.cells) {
			for (const face of cell) {
				if (!boundingCellsOfFaces.has(face)) {
					boundingCellsOfFaces.set(face, []);
					faceIndices.set(face, faceIndices.size);
				}
				boundingCellsOfFaces.get(face)!.push(cell);
			}
		}

		const boundingFacesOfEdges = new Map<Edge, Face[]>();
		for (const face of this.faces) {
			for (const [_, edge] of face) {
				if (!boundingFacesOfEdges.has(edge)) {
					boundingFacesOfEdges.set(edge, []);
					edgeIndices.set(edge, edgeIndices.size);
				}
				// Here, faces (to become edges) are added to each set in an order that may not produce a new face
				// correctly. They are reordered later
				boundingFacesOfEdges.get(edge)!.push(face);
			}
		}

		const boundingEdgesOfVerts = new Map<Vert, Edge[]>();
		for (const edge of this.edges) {
			for (const vert of edge) {
				if (!boundingEdgesOfVerts.has(vert)) {
					boundingEdgesOfVerts.set(vert, []);
				}
				boundingEdgesOfVerts.get(vert)!.push(edge);
			}
		}

		const newVerts = this.cells.map(centroid);
		const newEdges: Edge[] = [...boundingCellsOfFaces.values()].map(
			boundingCells => boundingCells.map(cell => newVerts[cellIndices.get(cell)!]) as Edge
		);
		const newEdgeLoops = new Map<Edge, EdgeLoop[]>();
		for (const edge of newEdges) {
			newEdgeLoops.set(edge, loops(edge));
		}

		const newFaces: Face[] = [...boundingFacesOfEdges.values()].map(
			boundingFaces => reorderEdges(
				boundingFaces.map(face => newEdges[faceIndices.get(face)!]),
				newEdgeLoops,
			)
		);
		const newCells: Cell[] = [...boundingEdgesOfVerts.values()].map(
			boundingEdges => boundingEdges.map(edge => newFaces[edgeIndices.get(edge)!])
		);
		return new Mesh4(
			newVerts,
			newEdges,
			newFaces,
			newCells,
			[...newEdgeLoops.values()].flat(),
		);
	}

	scale(scalar: number) {
		for (const vert of this.verts) {
			for (let i = 0; i < vert.length; i++) {
				vert[i] *= scalar;
			}
		}
		return this;
	}

	transform(transform: Transform4) {
		for (const vert of this.verts) {
			vert.copy(transform.transformVec(vert));
		}
		return this;
	}

	join(mesh: Mesh4) {
		return new Mesh4(
			[...this.verts, ...mesh.verts],
			[...this.edges, ...mesh.edges],
			[...this.faces, ...mesh.faces],
			[...this.cells, ...mesh.cells],
		);
	}

	joinEdges(mesh: Mesh4) {
		return new Mesh4(
			[...this.verts, ...mesh.verts],
			[...this.edges, ...mesh.edges],
			[...this.faces],
			[...this.cells],
		);
	}
	
	/**
	 * Computes the cross-section of a mesh with the W = 0 3-space.
	 * @param cells 
	 * @returns 
	 */
	crossSect(/* space: Space3_4 */): Mesh4 {
		return new Mesh4(...crossSect(this.cells));
	}

	singleCellMesh(index: number): Mesh4 {
		const cell = this.cells[index];

		const edges = new Set<Edge>();
		const verts = new Set<Vert>();
		const edgeLoops = new Set<EdgeLoop>();
		for (const face of cell) {
			for (const edgeLoop of face) {
				const [vert, edge] = edgeLoop;
				edges.add(edge);
				verts.add(vert);
				edgeLoops.add(edgeLoop);
			}
		}

		return new Mesh4(
			[...verts],
			[...edges],
			cell,
			[cell],
			[...edgeLoops],
		);
	}
}

/**
 * Computes the center of volume of a cell.
 * https://mathworld.wolfram.com/PolyhedronCentroid.html
 * @param cell 
 * @returns 
 */
const centroid = (cell: Cell): Vector4 => {
	const verts = new Set<Vector4>();
	for (const face of cell) {
		for (const [vert, _] of face) {
			verts.add(vert);
		}
	}

	if (verts.size > 4) {
		throw new Error("not implemented. tetrahedra only");
	}

	let cumsum = new Vector4();
	for (const vert of verts) {
		cumsum = cumsum.add(vert);
	}

	return cumsum.multScalar(1/4);

	// const cumsum = new Vector4();

	// for (const face of cell) {
	// 	for (const triangle of triangulate(face)) {
	// 		const bivector = triangle[1].subtract(triangle[0])
	// 				.outer(triangle[2].subtract(triangle[0]));

	// 		const sumAb = triangle[0].add(triangle[1]);
	// 		const sumBc = triangle[1].add(triangle[2]);
	// 		const sumCa = triangle[2].add(triangle[0]);

	// 		for (let i = 0; i < 4; i++) {
	// 			cumsum[i] += bivector.dotVec(Vector4.basis(i))
	// 					* (sumAb[i]**2 + sumBc[i]**2 + sumCa[i]**2);
	// 		}
	// 	}
	// }

	// return cumsum.multScalar(1/48);
};

/**
 * Generates the triangulations of a face.
 * @param face 
 */
const triangulate = function* (face: Face): Generator<Vector4[], void, void> {
	for (let i = 1; i < face.length - 1; i++) {
		// Select vertices to create a triangle fan
		yield [
			face[0][0],
			face[i][0],
			face[i + 1][0],
		];
	}
};

/**
 * 
 * @param {Mesh4} geometry 
 * @param {number[]} vertIndices 
 * @returns {Bivector4} 
 */
const bivectorFromTri = (geometry: Mesh4, vertIndices: number[]): Bivector4 => {
	const dir0 = geometry.verts[vertIndices[1]].subtract(geometry.verts[vertIndices[0]]);
	const dir1 = geometry.verts[vertIndices[2]].subtract(geometry.verts[vertIndices[0]]);

	return dir0.outer(dir1);
};
