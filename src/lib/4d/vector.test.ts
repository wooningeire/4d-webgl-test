import {describe, expect, it} from "vitest";

import {Rotor4, Vector4} from "$/4d/vector";

const {cos, sin, PI} = Math;

describe.concurrent(Rotor4.name, () => {
    it("maintains unit-size rotors", async () => {
        // incomplete

        const a = Rotor4.planeAngle(new Vector4(1, 0, 0, 0).outer(new Vector4(0, 1, 0, 0)), PI / 4);
        const b = Rotor4.planeAngle(new Vector4(0, 0, 1, 0).outer(new Vector4(0, 0, 0, 1)), PI / 4);

        expect(a.magSq).toBeCloseTo(1);
        expect(b.magSq).toBeCloseTo(1);

        expect(a.mult(b).magSq).toBeCloseTo(1);
    });

    it("multiplies correctly", async () => {
        const a = Rotor4.planeAngle(new Vector4(1, 0, 0, 0).outer(new Vector4(0, 1, 0, 0)), PI / 4);
        const b = Rotor4.planeAngle(new Vector4(0, 0, 1, 0).outer(new Vector4(0, 0, 0, 1)), PI / 4);

        const prod = a.mult(b);
        const prodExpected = new Rotor4(
            cos(PI / 8)**2,
            sin(PI / 8) * cos(PI / 8),
            0,
            0,
            0,
            0,
            cos(PI / 8) * sin(PI / 8),
            sin(PI / 8)**2,
        );


        prod.forEach((_, i) => {
            expect(prod[i]).toBeCloseTo(prodExpected[i]);
        });
    });

    it.todo("performs simple rotation correctly", async () => {
        const vec = new Vector4(2, 3, 5, 7);
        const rot = Rotor4.planeAngle(new Vector4(1/2, 1/2, 1/2, 1/2).outer(new Vector4(0, 0, 0, 1)), PI / 3);

        const prod = rot.rotateVector(vec);
        const prodExp = new Vector4();

        prod.forEach((_, i) => {
            expect(prod[i]).toBeCloseTo(prodExp[i]);
        });
    });

    it("performs double rotation correctly", async () => {
        // Multiplication with a zw rotor should not affect how the x basis vector is rotated.
        const vec0 = new Vector4(1, 0, 0, 0);
        const vec1 = new Vector4(0, 0, 0, 1);
    
        const a = Rotor4.planeAngle(new Vector4(1, 0, 0, 0).outer(new Vector4(0, 1, 0, 0)), PI / 4);
        const b = Rotor4.planeAngle(new Vector4(0, 0, 1, 0).outer(new Vector4(0, 0, 0, 1)), PI / 3);
        const prod = a.mult(b);


        const vecOut0 = vec0.multRotor(prod);
        const vecExp0 = vec0.multRotor(a);
        
        vecOut0.forEach((_, i) => {
            expect(vecOut0[i]).toBeCloseTo(vecExp0[i]);
        });


        const vecOut1 = vec1.multRotor(prod);
        const vecExp1 = vec1.multRotor(b);
        
        vecOut1.forEach((_, i) => {
            expect(vecOut1[i]).toBeCloseTo(vecExp1[i]);
        });
    });

    it("calculates rotor between two vectors correctly", async () => {
        const vec0 = new Vector4(1, 2, 3, 4);
        const vec1 = new Vector4(4, 3, 2, 1);
        const rotor = Rotor4.between(vec0, vec1);

        console.log(rotor);

        const vecOut = rotor.rotateVector(vec0);
        vecOut.forEach((_, i) => {
            expect(vecOut[i]).toBeCloseTo(vec1[i]);
        })
    });
});