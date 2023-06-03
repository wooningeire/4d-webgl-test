import {describe, expect, it} from "vitest";

import {Matrix5, Transform4} from "$/4d/Transform4";


describe.concurrent(Matrix5.name, () => { 
    it("retrieves cells correctly", async () => {
        const mat = new Matrix5(
            1, 2, 3, 4, 5,
            6, 7, 8, 9, 10,
            11, 12, 13, 14, 15,
            16, 17, 18, 19, 20,
            21, 22, 23, 24, 25,
        );
    
        expect(mat.cell(0, 0)).toBe(1);
        expect(mat.cell(0, 1)).toBe(2);
        expect(mat.cell(1, 0)).toBe(6);
        expect(mat.cell(2, 4)).toBe(15);
        expect(mat.cell(3, 3)).toBe(19);
        expect(mat.cell(4, 3)).toBe(24);
        expect(mat.cell(4, 4)).toBe(25);
    });

    it("multiplies correctly", async () => {
        const a = new Matrix5(
            2, -3, -5, 7, -11,
            13, -17, 19, 23, 29,
            -31, 37, -41, 43, 47,
            53, -59, 61, -67, 71,
            73, 79, -83, 89, 97,
        );
    
        const b = new Matrix5(
            101, 103, 107, -109, 113,
            -127, 131, 137, 139, 149,
            151, -157, 163, 167, 173,
            -179, 181, -191, 193, 197,
            199, -211, 223, 227, 229,
        );
    
        expect(a.dotMat(b)).toEqual(new Matrix5(
            696, 17263, -18963, 25037, 10127,
            15446, 6793, -6381, 11963, 35957,
            14688, 12061, -14593, 8663, 30085,
            32526, -5431, 7587, -701, 31053,
            19490, 15939, -19307, 11301, 40503,
        ));
        expect(b.dotMat(a)).toEqual(new Matrix5(
            -3614, 4186, -4802, -2616, -2226,
            7995, -5827, 4233, 10415, 13395,
            -12365, 5957, -2663, 20643, 14151,
            48179, -38955, 36161, -605, 10811,
            -11821, 26541, 9737, 28359, 45407,
        ));
    });

    it("inverts correctly", async () => {
        const mat = new Matrix5(
            2, -3, -5, 7, -11,
            13, -17, 19, 23, 29,
            -31, 37, -41, 43, 47,
            53, -59, 61, -67, 71,
            73, 79, -83, 89, 97,
        );
        
        const inv = mat.inv();
        const invExpected = new Matrix5(
            32415/8888368, -(979/2222092), -(256815/17776736), 1105/2222092, 127659/17776736,
            -(2159237/17776736), 15925/4444184, -(682043/35553472), -(70179/4444184), 213607/35553472,
            -(1981873/17776736), 124055/4444184, -(742271/35553472), -(67389/4444184), 8059/35553472,
            82683/17776736, 100227/4444184, -(79243/35553472), -(33685/4444184), 14679/35553472,
            -(61929/17776736), 2693/4444184, 379593/35553472, 28737/4444184, -(6157/35553472),
        );

        inv.forEach((cell, i) => {
            expect(cell).toBeCloseTo(invExpected[i]);
        });
    });
});


// describe.concurrent(Transform4.name, () => {
//     it("produces valid matrices", async () => {
//     });
// });