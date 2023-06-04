import {describe, expect, it} from "vitest";

import {Mesh4} from "$/4d/Mesh4";
import {Vector4} from "$/4d/vector";

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
