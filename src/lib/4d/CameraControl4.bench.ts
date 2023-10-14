import { describe, expect, it, bench} from "vitest";
import { Euler4, EulerPlane } from "./CameraControl4";
import type { Multiple } from "@/lib/util";

const {PI} = Math;
const REV = PI * 2;
const {Xy, Xz, Xw, Yz, Yw, Zw} = Euler4.Plane;

describe(Euler4.fromRotor.name, () => {
    const planeOrdering: Multiple<6, EulerPlane> = [Xy, Yz, Zw, Xw, Xz, Yw];
        
    const eulerExpected = new Euler4(
        [REV * 0.3, REV * 0.12, REV * 0.44, -REV * 0.15, -REV * 0.3, REV * 0.1],
        planeOrdering,
    );

    const rotorExpected = eulerExpected.asRotor();


    const EPSILON = 1e-15;

    bench("partial derivative only forward", () => {
        const N_ITERATIONS = 128;


        const euler = new Euler4(
            [0, 0, 0, 0, 0, 0],
            planeOrdering,
        );

        // Function to minimize
        const f = (testEuler=euler) => {
            const testRotor = testEuler.asRotor();
            return rotorExpected.sqDist(testRotor);
        };
        const partialDeriv = (current: number, plane: EulerPlane) => {
            const newAngles = [...euler.angles];
            newAngles[plane] += EPSILON;

            const newEuler = new Euler4(newAngles as Multiple<6, number>, planeOrdering);
            const valueForward = f(newEuler);

            return (valueForward - current) / EPSILON;
        };


        for (let iteration = 0; iteration < N_ITERATIONS; iteration++) {
            const current = f();
            const gradient = [0, 1, 2, 3, 4, 5].map(plane => partialDeriv(current, plane));
    
            for (let i = 0; i < 6; i++) {
                euler.angles[i] -= gradient[i] * Math.PI / 2;
            }
        }
    });

    bench("partial derivative forward and backward", () => {
        const N_ITERATIONS = 96;


        const euler = new Euler4(
            [0, 0, 0, 0, 0, 0],
            planeOrdering,
        );

        // Function to minimize
        const f = (testEuler=euler) => {
            const testRotor = testEuler.asRotor();
            return rotorExpected.sqDist(testRotor);
        };
        const partialDeriv = (current: number, plane: EulerPlane) => {
            const newAngles = [...euler.angles];
            newAngles[plane] += EPSILON;

            const newEuler = new Euler4(newAngles as Multiple<6, number>, planeOrdering);
            const valueForward = f(newEuler);

            newAngles[plane] -= 2 * EPSILON;
            const valueBackward = f(newEuler);


            return (valueForward - valueBackward) / (2 * EPSILON);
        };


        for (let iteration = 0; iteration < N_ITERATIONS; iteration++) {
            const current = f();
            const gradient = [0, 1, 2, 3, 4, 5].map(plane => partialDeriv(current, plane));
    
            for (let i = 0; i < 6; i++) {
                euler.angles[i] -= gradient[i] * Math.PI / 2;
            }
        }
    });
});

    /* static fromRotor(rotor: Rotor4, planeOrdering: Multiple<6, Plane>): Euler4 {
        const euler = new Euler4(
            [0, 0, 0, 0, 0, 0],
            planeOrdering,
        );

        // Use gradient descent

        const EPSILON = 1e-8;

        // Function to minimize
        const f = (testEuler=euler) => {
            const testRotor = testEuler.asRotor();
            return rotor.sqDist(testRotor);
        };

        const fShift = (plane: Plane) => {
            const newAngles = [...euler.angles];
            newAngles[plane] += EPSILON;

            const newEuler = new Euler4(newAngles as Multiple<6, number>, planeOrdering);
            return f(newEuler);
        };

        const fShiftDouble = (plane0: Plane, plane1: Plane) => {
            const newAngles = [...euler.angles];
            newAngles[plane0] += EPSILON;
            newAngles[plane1] += EPSILON;

            const newEuler = new Euler4(newAngles as Multiple<6, number>, planeOrdering);
            return f(newEuler);
        };

        const partialDeriv = (plane: Plane) => {
            return (fShift(plane)
                    - f()) / EPSILON;
        };

        const partialDerivSecond = (plane0: Plane, plane1: Plane) => {
            return (fShiftDouble(plane0, plane1)
                    - fShift(plane0)
                    - fShift(plane1)
                    + f()) / EPSILON**2;
        };



        for (let iteration = 0; iteration < 128; iteration++) {
            const hessian = new Matrix(6, 6, false);
            hessian.setData(
                [0, 1, 2, 3, 4, 5].map(row =>
                    [0, 1, 2, 3, 4, 5].map(col => partialDerivSecond(row, col))
                ).flat()
            );
            const hessianInverse = hessian.invert();

            const gradient = new Matrix(6, 1, false);
            gradient.setData([0, 1, 2, 3, 4, 5].map(plane => partialDeriv(plane)));


            const prod = Matrix.multiply(hessianInverse, gradient);
            // console.log(hessianInverse.getData(), gradient.getData(), prod.getData());

            console.log(f());
    
            for (let i = 0; i < 6; i++) {
                euler.angles[i] -= prod[i];
            }
            // console.log(euler.angles);
        }
    } */