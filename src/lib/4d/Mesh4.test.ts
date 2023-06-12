import {describe, expect, it, test} from "vitest";

import {Mesh4} from "$/4d/Mesh4";
import {Vector4} from "$/4d/vector";
import {construct} from "$/4d/construct";

describe.concurrent(Mesh4.fromVertsFacesCells.name, () => { 
    // skewed square pyramid
    const verts = [
        new Vector4(0, 0, 0, 0),
        new Vector4(1, 0, 0, 0),
        new Vector4(0, 1, 0, 0),
        new Vector4(1, 1, 0, 0),
        new Vector4(0, 0, 1, 0),
    ];
    const facesVertIndexes = [
        [0, 1, 2, 3],

        [4, 0, 1],
        [4, 1, 2],
        [4, 2, 3],
        [4, 3, 0],
    ];

    const skewedSquarePyramidMesh = Mesh4.fromVertsFacesCells(verts, facesVertIndexes);


    it("produces correct number of faces", async () => {
        expect(skewedSquarePyramidMesh.faces.length).toBe(5);
    });

    it("filters out duplicate edges correctly", async () => {
        expect(skewedSquarePyramidMesh.edges.length).toBe(8);
    });
});

describe.concurrent(Mesh4.prototype.crossSect.name, () => {
    test("mesh fully contained in 3-space", () => {
        const cube = construct.regularHexahedron();
        cube.cells.push(cube.faces);
        const intersection = cube.crossSect();

        expect(intersection.verts.length).toBe(cube.verts.length);
        expect(intersection.edges.length).toBe(cube.edges.length);
        expect(intersection.faces.length).toBe(cube.faces.length);
    });

    test("triangle with 1 edge in 3-space and 1 vertex outside", () => {
        const triangle = Mesh4.fromVertsFacesCells(
            [
                new Vector4(-1, 0, 0, 0),
                new Vector4(1, 0, 0, 0),
                new Vector4(0, 0, 0, 1),
            ], [
                [0, 1, 2],
            ], [
                [0],
            ],
        )
        const intersection = triangle.crossSect();

        expect(intersection.verts.length).toBe(2);
        expect(intersection.edges.length).toBe(1);
        expect(intersection.faces.length).toBe(0);
    });

    test("triangle where the intersection edge coincides with a vertex of the triangle", () => {
        const triangle = Mesh4.fromVertsFacesCells(
            [
                new Vector4(1, 0, 0, 0),
                new Vector4(0, 0, 0, -1),
                new Vector4(0, 0, 0, 1),
            ], [
                [0, 1, 2],
            ], [
                [0],
            ],
        )
        const intersection = triangle.crossSect();

        expect(intersection.verts.length).toBe(2);
        expect(intersection.edges.length).toBe(1);
        expect(intersection.faces.length).toBe(0);
    });

    test("tetrahedron with 1 face in 3-space and 1 vertex outside", () => {
        const pyramid = Mesh4.fromVertsFacesCells(
            [
                new Vector4(0, 0, 1, 0),
                new Vector4(-1, -1, 0, 0),
                new Vector4(-2, 2, -1, 0),
                new Vector4(0, 0, 0, 1),
            ], [
                [0, 1, 2],
                [0, 1, 3],
                [0, 2, 3],
                [1, 2, 3],
            ], [
                [0, 1, 2, 3],
            ],
        );
        const intersection = pyramid.crossSect();
        
        expect(intersection.verts.length).toBe(3);
        expect(intersection.edges.length).toBe(3);
        expect(intersection.faces.length).toBe(1);
    });

    test("tetrahedron with 1 vertex in 3-space and 1 face outside", () => {
        const pyramid = Mesh4.fromVertsFacesCells(
            [
                new Vector4(0, 0, 1, 2),
                new Vector4(-1, -1, 0, 2),
                new Vector4(-2, 2, -1, 1),
                new Vector4(0, 0, 0, 0),
            ], [
                [0, 1, 2],
                [0, 1, 3],
                [0, 2, 3],
                [1, 2, 3],
            ], [
                [0, 1, 2, 3],
            ],
        );
        const intersection = pyramid.crossSect();
        
        expect(intersection.verts.length).toBe(1);
        expect(intersection.edges.length).toBe(0);
        expect(intersection.faces.length).toBe(0);
    });

    test("unclosed 2-cell with 1 face in 3-space and 2 vertices outside", () => {
        const pyramid = Mesh4.fromVertsFacesCells(
            [
                new Vector4(0, 0, 1, 0),
                new Vector4(-1, -1, 0, 0),
                new Vector4(-2, 2, -1, 0),
                new Vector4(0, 0, 0, 1),
                new Vector4(0, 0, 0, -1),
            ], [
                [0, 1, 2],

                [0, 1, 3],
                [0, 2, 3],
                [1, 2, 3],

                [0, 1, 4],
                [0, 2, 4],
                [1, 2, 4],
            ], [
                [0, 1, 2, 3],
                [0, 1, 2, 4],
            ],
        );
        const intersection = pyramid.crossSect();
        // console.log(intersection.edges);
        
        expect(intersection.verts.length).toBe(3);
        expect(intersection.edges.length).toBe(3);
        expect(intersection.faces.length).toBe(1);
    });
});