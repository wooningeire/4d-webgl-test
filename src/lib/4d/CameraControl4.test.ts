import { describe, it } from "vitest";
import { Euler4, Plane } from "./CameraControl4";
import type { NLengthTuple } from "../util";

const {PI} = Math;
const REV = PI * 2;

describe(Euler4.name, () => {
    const {Xy, Xz, Xw, Yz, Yw, Zw} = Euler4.Plane;
    it("inverts quaternion conversions reasonably", () => {
        const planeOrdering: NLengthTuple<Plane, 6> = [Xy, Yz, Zw, Xw, Xz, Yw];
        
        const euler = new Euler4(
            [REV * 0.3, REV * 0.12, REV * 0.44, REV * 0.15, REV * 0.3, REV * 0.1],
            planeOrdering,
        );

        const rotor = euler.asRotor();
        console.log(euler);
        const newEuler = Euler4.fromRotor(rotor, planeOrdering);
        console.log(newEuler);

        console.log();

        console.log(rotor);
        console.log(newEuler.asRotor());
    });
});