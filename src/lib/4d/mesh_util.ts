import type {Vector4} from "./vector";

export type Vert = Vector4;
export type Edge = [Vert, Vert];
export type EdgeLoop = [Vert, Edge];
/** **Ordered** list of edge loops. */
export type Face = EdgeLoop[];
export type FaceLoop = [Edge, Face];
export type Cell = Face[];

/**
 * Constructs the two edge loops that correspond with an edge.
 * @param edge 
 */
export const loops = (edge: Edge): [EdgeLoop, EdgeLoop] => [
	[edge[0], edge],
	[edge[1], edge],
];

/**
 * Reorders a list of edges into a list of edge loops that properly represent a face.
 * @param edges Edges of the face, in any order.
 * @param edgeLoops Map from each edge to the two edge loops it corresponds to.
 */
export const reorderEdges = (edges: Edge[], edgeLoops: Map<Edge, EdgeLoop[]>): Face => {
	// TODO I like the `find` function

	const loops: EdgeLoop[] = [];

	const uncheckedEdges = new Set<Edge>(edges);

	// Does not matter which edge is first nor its orientation, so just pick the one that is already first and use its
	// orientation
	loops[0] = edgeLoops.get(edges[0])!
			.find(edgeLoop => edgeLoop[0] === edges[0][0])!;
	uncheckedEdges.delete(edges[0]);
	let nextVertex = edges[0][1]; // Second vertex of the first edge

	for (let i = 1; i < edges.length; i++) {
		const nextEdge = [...uncheckedEdges].find(edge => edge.includes(nextVertex))!;

		const candidateLoops = edgeLoops.get(nextEdge)!;
		loops[i] = candidateLoops[0][0] === nextVertex
				? candidateLoops[0]
				: candidateLoops[1];

		uncheckedEdges.delete(nextEdge);
		nextVertex = nextEdge[0] === nextVertex
				? nextEdge[1]
				: nextEdge[0];
	}

	return loops;
};