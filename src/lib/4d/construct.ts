import {Vector4} from "./vector";
import {Mesh4, type Face} from "./Mesh4";
import {numberArrayKey} from "../util";

const {sqrt, SQRT1_2, sign, abs, hypot} = Math;
const PHI = (1 + sqrt(5)) / 2;
const PHI_I = PHI - 1; // === 1 / phi
const EPSILON = 1e-12;

export const construct = {
    regularHexahedron(): Mesh4 {
        const verts: Vector4[] = [];
        const sqrt1_3 = sqrt(1 / 3);
        const values = [sqrt1_3, -sqrt1_3];
        for (let i = 0; i < 0b1000; i++) {
            verts.push(new Vector4(
                values[0b1 & i],
                values[0b1 & i >>> 1],
                values[0b1 & i >>> 2]));
        }

        return Mesh4.fromVertsFacesCells(verts, [
            [0, 1, 3, 2], // front face
            [4, 5, 7, 6], // back face
            [1, 3, 7, 5], // left face 
            [0, 2, 6, 4], // right face
            [0, 1, 5, 4], // top face
            [2, 3, 7, 6], // bottom face
        ]);
    },

	// https://en.wikipedia.org/wiki/5-cell#Construction
	regularPentachoron(): Mesh4 {
		const s = SQRT1_2;
		const f = sqrt(1 / 5);

        const verts = [
			new Vector4(s, s, s, -f).normalize(),
			new Vector4(-s, -s, s, -f).normalize(),
			new Vector4(-s, s, -s, -f).normalize(),
			new Vector4(s, -s, -s, -f).normalize(),
			new Vector4(0, 0, 0, sqrt(5) - f).normalize(),
		];

        // All sets of 4 vertices comprise a cell in a simplex
		const cellVertIndexes = [
			[0, 1, 2, 3],
			[0, 1, 2, 4],
			[0, 1, 3, 4],
			[0, 2, 3, 4],
			[1, 2, 3, 4],
		];

        const builder = new MeshCellBuilder();
        for (const cell of cellVertIndexes) {
            builder.addTetrahedronCell(cell.map(vertIndex => verts[vertIndex]) as NLengthTuple<Vector4, 4>);
        }
		return builder.mesh();
	},
    
    regularOctachoron(): Mesh4 {
		// General form of cube

		const verts: Vector4[] = generateOctachoronVerts();

		const cellVertIndexes = [
			[0, 2, 4, 6, 8, 10, 12, 14], // right
			[1, 3, 5, 7, 9, 11, 13, 15], // left
			[0, 1, 4, 5, 8, 9, 12, 13], // top
			[2, 3, 6, 7, 10, 11, 14, 15], // bottom
			[0, 1, 2, 3, 8, 9, 10, 11], // front
			[4, 5, 6, 7, 12, 13, 14, 15], // back
			[0, 1, 2, 3, 4, 5, 6, 7], // kata
			[8, 9, 10, 11, 12, 13, 14, 15], // ana
		];

        const builder = new MeshCellBuilder();
        for (const cell of cellVertIndexes) {
            builder.addHexahedronCell(cell.map(vertIndex => verts[vertIndex]) as NLengthTuple<Vector4, 8>);
        }
		return builder.mesh();
    },
    
	regularHexadecachoron(): Mesh4 {
		// General form of orthoplex
		// Vertices are permutations of (±1, 0, 0, 0) (2 for each axis)
		// All vertices are connected, apart from opposite vertices which lie on the same axis

		const verts: Vector4[] = generateHexadecachoronVerts();
        
        const cellVertIndexes = [
			[0, 2, 4, 6],
			[0, 2, 4, 7],
			[0, 2, 5, 6],
			[0, 2, 5, 7],
			[0, 3, 4, 6],
			[0, 3, 4, 7],
			[0, 3, 5, 6],
			[0, 3, 5, 7],
			[1, 2, 4, 6],
			[1, 2, 4, 7],
			[1, 2, 5, 6],
			[1, 2, 5, 7],
			[1, 3, 4, 6],
			[1, 3, 4, 7],
			[1, 3, 5, 6],
			[1, 3, 5, 7],
		];

        const builder = new MeshCellBuilder();
        for (const cell of cellVertIndexes) {
            builder.addTetrahedronCell(cell.map(vertIndex => verts[vertIndex]) as NLengthTuple<Vector4, 4>);
        }
		return builder.mesh();
	},

	regularIcositetrachoron(): Mesh4 {
		const verts: Vector4[] = [
            // [0, 8)
            // permutations of (±1, 0, 0, 0)
            ...generateHexadecachoronVerts(),

            // [8, 24)
            // (±.5, ±.5, ±.5, ±.5)
            // 08  + + + +
            // 09  − + + +
            // 10  + − + +
            // 11  − − + +
            // 12  + + − +
            // 13  − + − +
            // 14  + − − +
            // 15  − − − +
            // 16  + + + −
            // 17  − + + −
            // 18  + − + −
            // 19  − − + −
            // 20  + + − −
            // 21  − + − −
            // 22  + − − −
            // 23  − − − −
            ...generateOctachoronVerts(),
        ];

		// The octahedron's vertices are determined as follows:
		// [0]  1 pole on a (±1, 0, 0, 0)-permutation vertex
		// [1]  1 pole on a different (±1, 0, 0, 0)-permutation vertex that is not the opposite of [0]
		// [2:6]  A (±.5, ±.5, ±.5, ±.5) point such that:
		//    • The point has the same sign as [0] for the axis that [0] lies on
        //       (e.g. if [0] is (0, 0, −1, 0), then the Z component of this point must be −.5)
		//    • The point has the same sign as [1] for the axis that [1] lies on
		//    • For the remaining axes, the component may have either sign
		//	    	(e.g. if [0] is (0, 0, 0, −1)
		//		    	 and [1] is (1, 0, 0,  0), then the point must be (+.5, ±.5, ±.5, −.5))

        // Verts 0 and 1 should be on opposite axes of the octochoron, and so should 2 and 3, and 4 and 5
        // To do this, [2] and [3] can have the two variable axes have the same sign and [4] and [5] opposite signs
        const cellVertIndexes: number[][] = [];

        // Enumerate through each pair of axes
        for (let axis0 = 0; axis0 < 3; axis0++) {
            for (let axis1 = axis0 + 1; axis1 < 4; axis1++) {
                // Because the vert generator functions produce verts in expectable patterns, we can select the desired verts
                // by index simply by adding specific offsets together

                const remainingAxes = [0, 1, 2, 3]
                        .filter(axis => ![axis0, axis1].includes(axis)) as [number, number];

                // Find the amounts to add to each octachoron index to flip the sign of each component for the remaining axes
                const signFlipIncrement0 = 0b1 << remainingAxes[0];
                const signFlipIncrement1 = 0b1 << remainingAxes[1];


                // Enumerate through each combination of signs for the 2 components
                for (let i = 0b0; i < 0b100; i++) {
                    const axis0Neg = 0b1 & i >>> 1;
                    const axis1Neg = 0b1 & i;

                    // Find the amounts to add to each octachoron index to flip the sign of each component for the main axes,
                    // depending on whether their signs are flipped for this iteration
                    const signFlipIncrementAxis0 = axis0Neg === 1
                            ? 0b1 << axis0
                            : 0;
                    const signFlipIncrementAxis1 = axis1Neg === 1
                            ? 0b1 << axis1
                            : 0;
                    // Offset by 8 because the eight 16-cell verts are first in the vert list
                    const octachoronIndexOffset = 8 + signFlipIncrementAxis0 + signFlipIncrementAxis1;

                    cellVertIndexes.push([
                        // Verts from the 16-cell (which lie on the main axes)
                        axis0 * 2 + axis0Neg,
                        axis1 * 2 + axis1Neg,

                        // Verts from the 8-cell; one has no signs flipped and the other has both flipped
                        octachoronIndexOffset,
                        octachoronIndexOffset + signFlipIncrement0 + signFlipIncrement1,

                        // Ditto; one has one sign flipped and the other has the other sign flipped
                        octachoronIndexOffset + signFlipIncrement0,
                        octachoronIndexOffset + signFlipIncrement1,
                    ]);
                }
            }
        }
        const builder = new MeshCellBuilder();
        for (const cell of cellVertIndexes) {
            builder.addOctahedronCell(cell.map(vertIndex => verts[vertIndex]) as NLengthTuple<Vector4, 6>);
        }
		return builder.mesh();
	},
	
	// https://en.wikipedia.org/wiki/600-cell
	// http://eusebeia.dyndns.org/4d/600-cell
	regularHexacosichoron(): Mesh4 {
        //#region Generating vertices

        const evenPermutations4 = [
            [0, 1, 2, 3],
            [0, 2, 3, 1],
            [0, 3, 1, 2],
            [1, 0, 3, 2],
            [1, 2, 0, 3],
            [1, 3, 2, 0],
            [2, 0, 1, 3],
            [2, 1, 3, 0],
            [2, 3, 0, 1],
            [3, 0, 2, 1],
            [3, 1, 0, 2],
            [3, 2, 1, 0],
        ];
        const generateEvenPerm4Verts = function* (values: NLengthTuple<number, 4>): Generator<Vector4, void, void> {
            for (const perm of evenPermutations4) {
                yield new Vector4(...perm.map(index => values[index]));
            }
        };

        const generateSignCombinations = function* (values: number[]): Generator<number[], void, void> {
            for (let i = 0; i < 0b1 << values.length; i++) {
                yield values.map((value, j) => 0b1 & i >> j ? -value : value);
            }
        };

        // https://mathworld.wolfram.com/600-Cell.html
    	const verts = [
            // [0, 8)
            // permutations of (±1, 0, 0, 0)
            ...generateHexadecachoronVerts(),

            // [8, 24)
            // (±.5, ±.5, ±.5, ±.5)
            ...generateOctachoronVerts(),

            // [24, 120)
            // even permutations of (±φ, ±1, ±φ⁻¹, 0)
            ...[...generateSignCombinations([PHI/2, 1/2, PHI_I/2])]
                    .map(values => [...generateEvenPerm4Verts([...values, 0] as NLengthTuple<number, 4>)])
                    .flat(),
        ];

        //#endregion

        // We will add cells to the mest simply by finding groups of 4 vertices which have the same distance between them

        const edges = new Map<Vector4, Set<Vector4>>(); // Keeps track of the vertices adjacent to any given vertex
        const EDGE_LENGTH = PHI_I;

        // The 600-cell has tetrahedral cells, which means the vertices of any given cell all have the same distance.
        // Therefore, the other three vertices thus must all be in the set of adjacent vertices for a single vertex.
        // This also implies that, later when we iterate through each vertex, the set of tetrahedra we find for a single vertex
        //      is the set of all cells which contain that vertex.
        // This means that we do not have to store repeat edges in the `Map` (and this will make construction easier later, since we will
        //      not need to filter out duplicate cells).
        for (let i = 0; i < verts.length; i++) {
            const vert0 = verts[i];

            // Find the 12 vertices that have the target edge length from the vertex, excluding repeat edges in the `Map`
            const edgesForVert = new Set<Vector4>();
            for (let j = i + 1; j < verts.length; j++) {
                const vert1 = verts[j];
                if (abs(hypot(...vert0.subtract(vert1)) - EDGE_LENGTH) < EPSILON) {
                    edgesForVert.add(vert1);
                }
            }

            edges.set(vert0, edgesForVert);
        }
        
        // // The following would store repeat edges:
        // for (const vert0 of verts) {
        //     edges.set(
        //         vert0,
        //         // The 12 vertices that have the target edge length from the vertex
        //         new Set(
        //             verts.filter(vert1 => abs(hypot(...vert1.subtract(vert0)) - EDGE_LENGTH) < EPSILON)
        //         ),
        //     );
        // }

        const builder = new MeshCellBuilder();
        for (const [vert0, adjacents] of edges) {
            const adjacentsList = [...adjacents];
            for (let index1 = 0; index1 < adjacentsList.length - 2; index1++) {
                const vert1 = adjacentsList[index1];

                for (let index2 = index1 + 1; index2 < adjacentsList.length - 1; index2++) {
                    const vert2 = adjacentsList[index2];
                    // vert1 has to come first due to the way we constructed the map with no repeats
                    if (!edges.get(vert1)!.has(vert2)) continue;

                    for (let index3 = index2 + 1; index3 < adjacentsList.length; index3++) {
                        const vert3 = adjacentsList[index3];
                        if (!edges.get(vert1)!.has(vert3)) continue;
                        if (!edges.get(vert2)!.has(vert3)) continue;
                        
                        builder.addTetrahedronCell([vert0, vert1, vert2, vert3]);
                    }
                }
            }
        }

        // console.log(builder.cells.length);

        // return Mesh4.fromVertsFacesCells(verts, []);
        return builder.mesh();
	},
};

const generateOctachoronVerts = (): Vector4[] => {
    // Uses pattern in hypercube coordinates
    const verts: Vector4[] = [];
	const values = [.5, -.5];
	for (let i = 0; i < 0b10000; i++) {
		verts.push(new Vector4(
			values[0b1 & i],
			values[0b1 & i >>> 1],
			values[0b1 & i >>> 2], 
			values[0b1 & i >>> 3]));
	}

	return verts;
};

const generateHexadecachoronVerts = (): Vector4[] => {
    // Uses pattern in orthoplex coordinates
    const verts: Vector4[] = [];
	for (let i = 0; i < 4; i++) {
		const vert0 = new Vector4();
		const vert1 = new Vector4();
		vert0[i] = 1;
		vert1[i] = -1;

		verts.push(vert0, vert1);
	}

	return verts;
};

// https://stackoverflow.com/a/52490977
// Start the accumulator with 0 elements
type NLengthTuple<T, Length extends number> = NLengthTupleBuilder<T, Length, []>;

type NLengthTupleBuilder<T, TargetLength extends number, AccumulatorTuple extends T[]> =
        AccumulatorTuple["length"] extends TargetLength
                // When the accumulator has the desired length, return it as the tuple type
                ? AccumulatorTuple
                // Otherwise, extend the accumulator by one entry and check again
                : NLengthTupleBuilder<T, TargetLength, [...AccumulatorTuple, T]>;

/**
 * Constructs a mesh cell-by-cell.
 */
class MeshCellBuilder {
    /**
     * Since JavaScript does not provide unique object identifiers, a temporary map is used to identify them
     * instead
     */
    private readonly vertIds = new Map<Vector4, typeof this.maxVertId>();
    private maxVertId = 0;

    /**
     * Collection of tuples of a tuple of vert indexes and the face id determined by insertion order
     */
    private readonly facesAndFaceIds = new Map<ReturnType<typeof numberArrayKey>, [number[], number]>();

    /**
     * Collection of tuples of face indexes
     */
    /* private */ readonly cells: number[][] = [];

    private recordVerts(verts: Vector4[]) {
        for (const vert of verts) {
            if (this.vertIds.has(vert)) continue;
            this.vertIds.set(vert, this.maxVertId++);
        }
    }

    /**
     * 
     * @param verts 
     * @param facesByRelativeVertIndexes 
     * @returns The vert index tuples that make up the faces
     */
    private addCell(verts: Vector4[], facesByRelativeVertIndexes: number[][]) {
        this.recordVerts(verts);

        // get ids of the vertices from this context 
        const faces = facesByRelativeVertIndexes
                .map(vertIndexes => vertIndexes.map(vertIndex => this.vertIds.get(verts[vertIndex])!));

        
        // get the face ids for the cell

        const cell: number[] = [];

        // get ids of each of the faces from this context
        for (const face of faces) {
            const key = numberArrayKey(face);

            if (this.facesAndFaceIds.has(key)) {
                cell.push(this.facesAndFaceIds.get(key)![1]);
            } else {
                cell.push(this.facesAndFaceIds.size);
                this.facesAndFaceIds.set(key, [face, this.facesAndFaceIds.size]);
            }
        }

        this.cells.push(cell);
        
        return faces;
    }

    /**
     * 
     * @param verts Vertices, in any order
     * @returns 
     */
    addTetrahedronCell(verts: NLengthTuple<Vector4, 4>): number[][] {
        return this.addCell(
            verts,
            [
                [0, 1, 2],
                [0, 1, 3],
                [0, 2, 3],
                [1, 2, 3],
            ],
        );
    }

    /**
     * 
     * @param verts Vertices, in binary counting order
     * @returns 
     */
    addHexahedronCell(verts: NLengthTuple<Vector4, 8>): number[][] {
        return this.addCell(
            verts,
            [
                [0, 1, 3, 2], // right face
                [4, 5, 7, 6], // left face
                [0, 1, 5, 4], // bottom face
                [2, 3, 7, 6], // top face
                [0, 2, 6, 4], // front face
                [1, 3, 7, 5], // back face
            ],
        );
    }

    /**
     * 
     * @param verts Vertices, in axis order
     * @returns 
     */
    addOctahedronCell(verts: NLengthTuple<Vector4, 6>): number[][] {
        return this.addCell(
            verts,
            [
                // all tuples where first index in [0, 1], second in [2, 3], third in [4, 5]
                [0, 2, 4],
                [0, 2, 5],
                [0, 3, 4],
                [0, 3, 5],

                [1, 2, 4],
                [1, 2, 5],
                [1, 3, 4],
                [1, 3, 5],
            ],
        );
    }

    verts() {
        return [...this.vertIds.keys()];
    }

    faces() {
        return [...this.facesAndFaceIds.values()]
                .map(tuple => tuple[0]);
    }

    mesh3(): Mesh4 {
        return Mesh4.fromVertsFacesCells(
            this.verts(),
            this.faces(),
        );
    }

    mesh(): Mesh4 {
        return Mesh4.fromVertsFacesCells(
            this.verts(),
            this.faces(),
            this.cells,
        );
    }
}