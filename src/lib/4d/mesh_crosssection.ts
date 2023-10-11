import {reorderEdges, loops} from "./mesh_util";
import type {Edge, Face, Cell, Vert, EdgeLoop} from "./mesh_util";
import {Vector4} from "./vector";
import {numberSetKey} from "../util";

type EdgeCrossSection = Edge | Vert | null;
type FaceCrossSection = Face | Edge[] | null;

/**
 * Computes the cross-section of a mesh with the W = 0 3-space.
 * @param cells 
 * @returns 
 */
export const crossSect = (cells: Cell[]): [Vert[], Edge[], Face[], Cell[], EdgeLoop[]] => {
    const edgeIntersections = new Map<Edge, EdgeCrossSection>(); // To avoid recalculating intersections with the same edge
    const faceIntersections = new Map<Face, FaceCrossSection>();

    //#region Result mesh data

    // temp: just intersect with the xyz 3-space
    const vertIndices = new Map<Vert, number>();
    const addVert = (...verts: Vert[]) => {
        for (const vert of verts) {
            if (vertIndices.has(vert)) continue;
            vertIndices.set(vert, vertIndices.size);
        }
    };

    const edges = new Map<ReturnType<typeof numberSetKey>, Edge>();
    const addEdge = (edge: Edge): boolean => {
        const key = numberSetKey(edge.map(vert => vertIndices.get(vert)!));

        if (edges.has(key)) return false;
        edges.set(key, edge);

        return true;
    };

    const faces = new Map<ReturnType<typeof numberSetKey>, Face>();
    const addFace = (face: Face): boolean => {
        const key = numberSetKey(face.map(([vert, _]) => vertIndices.get(vert)!));

        if (faces.has(key)) return false;
        faces.set(key, face);

        return true;
    };

    const edgeLoops = new Map<Edge, EdgeLoop[]>();

    //#endregion


    //#region Helper intersection functions

    const crossSectEdge = (edge: Edge, edge0: Vert, edge1: Vert) => {
        const direction = edge1.subtract(edge0);
        const percent = -edge0[3] / direction[3];
    
        // 3-space does not intersect with this edge
        if (0 > percent || percent > 1) {
            edgeIntersections.set(edge, null);
            return null;
        }
    
        // 3-space fully contains this edge
        else if (isNaN(percent)) {
            const edgeClone: Edge = [edge0, edge1];
    
            addVert(edge0, edge1);
            addEdge(edgeClone); // need condition?
            edgeLoops.set(edgeClone, loops(edgeClone));
    
            edgeIntersections.set(edge, edgeClone);
            return edgeClone;
        }
        
        // 3-space intersects this edge at a single point
        else {
            const pointIntersection = 
                    percent === 0 ? edge0 :
                    percent === 1 ? edge1 :
                    edge0.add(direction.multScalar(percent));
            edgeIntersections.set(edge, pointIntersection);
    
            addVert(pointIntersection);
    
            return pointIntersection;
        }
    };

    const crossSectFace = (face: Face) => {
        const faceIntersection: Edge[] = [];

        let newEdge: Vert[] = [];
        let ignoreNextPointIntersection = false;
        // Does not handle concave faces
        for (const [edge0, edge] of face) {
            const edge1 = edge[0] === edge0
                    ? edge[1]
                    : edge[0];

            let intersection: EdgeCrossSection;

            // Has the intersection already been calculated for this edge?
            // This also ensures that different edges can reference the same vertices
            if (edgeIntersections.has(edge)) {
                intersection = edgeIntersections.get(edge)!;
            } else {
                intersection = crossSectEdge(edge, edge0, edge1);
            }

            // 3-space does not intersect with this edge
            if (intersection === null) continue;

            else if (intersection instanceof Vector4) {
                if (ignoreNextPointIntersection) {
                    ignoreNextPointIntersection = false;
                    continue;
                }

                // Vertex can be repeated if one vertex of the face lies in the 3-space
                if (newEdge[0] === intersection) continue;
                newEdge.push(intersection);

                if (newEdge.length !== 2) continue;
                // Edge can be repeated if one edge lies in the 3-space but the others do not
                if (addEdge(newEdge as Edge)) {
                    edgeLoops.set(newEdge as Edge, loops(newEdge as Edge));

                    if (!faceIntersection.some(edge => edge === newEdge)) {
                        faceIntersection.push(newEdge as Edge);
                    }
                }
                newEdge = [];
            }

            else {
                if (!faceIntersection.some(edge => edge === intersection)) {
                    faceIntersection.push(intersection);
                }
                newEdge = [];
                ignoreNextPointIntersection = true;
            }
        }

        // 3-space does not intersect with this face, or only by vertices and not any edges
        if (faceIntersection.length === 0) {
            // may need extra cases
            faceIntersections.set(face, null);
            return null;
        }

        // 3-space fully contains this face
        else if (faceIntersection.length === face.length) {
            const faceClone = reorderEdges(
                face.map(([_, edge]) => edgeIntersections.get(edge) as Edge),
                edgeLoops,
            );

            addFace(faceClone);

            faceIntersections.set(face, faceClone);
            return faceClone;
        }

        // 3-space intersects this face by some edges
        else {
            faceIntersections.set(face, faceIntersection);
            return faceIntersection;
        }
    };

    //#endregion


    for (const cell of cells) {
        const cellIntersection: Face[] = [];

        let newFace: Edge[] = [];
        const newFaceVerts = new Set<Vert>();
        const newFaceEdges = new Set<ReturnType<typeof numberSetKey>>();

        // Does not handle concave cells
        for (const face of cell) {
            let intersection: FaceCrossSection;

            if (faceIntersections.has(face)) {
                intersection = faceIntersections.get(face)!;
            } else {
                intersection = crossSectFace(face);
            }
    
            // 3-space does not intersect with this face, or only by vertices and not any edges
            // may need extra cases
            if (intersection === null) continue;
            
            // 3-space intersects this face by some edges
            else if (isEdge(intersection[0])) {
                for (const edge of intersection as Edge[]) {
                    // Edges can reappear if two faces share an edge which becomes part of the intersection
                    const key = numberSetKey(edge.map(vert => vertIndices.get(vert)!));
                    if (newFaceEdges.has(key)) continue;

                    newFace.push(edge);
                    newFaceEdges.add(key);
                    
                    // If each vertex appears twice in the face's edge list, then the face forms a complete loop
                    for (const vert of edge) {
                        if (newFaceVerts.has(vert)) {
                            newFaceVerts.delete(vert);
                        } else {
                            newFaceVerts.add(vert);
                        }
                    }
                }
                if (newFaceVerts.size !== 0) continue;

                const thisNewFace = reorderEdges(newFace, edgeLoops);
                if (addFace(thisNewFace)) {
                    cellIntersection.push(thisNewFace);
                }
                newFace = [];
                newFaceEdges.clear();
            }

            else {
                cellIntersection.push(intersection as Face);
            }
        }
        /* 
        // 3-space does not intersect with this cell, or only by verts/edges and not faces
        if (cellIntersection.length === 0) continue;

        // 3-space fully contains this cell
        if (cellIntersection.length === cell.length) {

        }

        // 3-space intersects this face by some faces
         */
    }

    return [
        [...vertIndices.keys()],
        [...edges.values()],
        [...faces.values()],
        [],
        [],
    ];
};

const isEdge = (array: Vert | Edge | EdgeLoop | Face): array is Edge =>
		array[0] instanceof Vector4 && array[1] instanceof Vector4;

const isEdgeLoop = (array: Edge | EdgeLoop | Face): array is EdgeLoop =>
		array[0] instanceof Vector4 && isEdge(array[1]);