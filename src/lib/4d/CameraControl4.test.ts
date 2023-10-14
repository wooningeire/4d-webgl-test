import { describe, expect, it, bench} from "vitest";
import { Euler4, EulerPlane } from "./CameraControl4";
import type { Multiple } from "../util";

const {PI} = Math;
const REV = PI * 2;
const {Xy, Xz, Xw, Yz, Yw, Zw} = Euler4.Plane;

describe(Euler4.name, () => {
    it("inverts quaternion conversions reasonably", () => {
        const planeOrdering: Multiple<6, EulerPlane> = [Xy, Yz, Zw, Xw, Xz, Yw];
        
        const euler = new Euler4(
            [REV * 0.3, REV * 0.12, REV * 0.44, -REV * 0.15, -REV * 0.3, REV * 0.1],
            planeOrdering,
        );

        const rotor = euler.asRotor();
        const newEuler = Euler4.fromRotor(rotor, planeOrdering);

        const newRotor = newEuler.asRotor();

        // console.log(euler, newEuler);
        // console.log(rotor, newRotor);
        
        for (let i = 0; i < rotor.length; i++) {
            expect(rotor[i]).toBeCloseTo(newRotor[i]);
        }
    });
});