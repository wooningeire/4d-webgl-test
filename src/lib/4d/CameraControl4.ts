import { Transform4 } from "@/lib/4d/Transform4";
import { Vector4, Rotor4 } from "@/lib/4d/vector";

import type {Multiple} from "@/lib/util";

export enum Plane {
    Xy = 0,
    Xz = 1,
    Xw = 2,
    Yz = 3,
    Yw = 4,
    Zw = 5,
}
export class Euler4 {
    static readonly Plane = Plane;

    constructor(
        public angles: Multiple<6, number>,
        public planeOrdering: Multiple<6, Plane>,
    ) {}

    asRotor(): Rotor4 {
        let rotor = new Rotor4();
        
        for (let i = 0; i < 6; i++) {
            const plane = [0, 0, 0, 0, 0, 0];
            plane[this.planeOrdering[i]] = 1;

            rotor = rotor.mult(Rotor4.planeAngle(plane, this.angles[i]));
        }

        return rotor;
    }

    static fromRotor(rotor: Rotor4, planeOrdering: Multiple<6, Plane>): Euler4 {
        const euler = new Euler4(
            [0, 0, 0, 0, 0, 0],
            planeOrdering,
        );

        // Use gradient descent

        const EPSILON = 1e-15;
        const N_ITERATIONS = 128;

        // Function to minimize
        const f = (testEuler=euler) => {
            const testRotor = testEuler.asRotor();
            return rotor.sqDist(testRotor);
        };
        const partialDeriv = (current: number, plane: Plane) => {
            const newAngles = [...euler.angles];
            newAngles[plane] += EPSILON;

            const newEuler = new Euler4(newAngles as Multiple<6, number>, planeOrdering);
            const valueForward = f(newEuler);
            
            // newAngles[plane] -= 2 * EPSILON;
            // const valueBackward = f(newEuler);

            return (valueForward - current) / EPSILON;
        };


        for (let iteration = 0; iteration < N_ITERATIONS; iteration++) {
            const current = f();
            const gradient = [0, 1, 2, 3, 4, 5].map(plane => partialDeriv(current, plane));
    
            for (let i = 0; i < 6; i++) {
                euler.angles[i] -= gradient[i] * Math.PI / 2;
            }
        }

        return euler;
    }
}

export class Orbit4 {
    constructor(
        public center=new Vector4(),
        // public orientation: Rotor4=new Rotor4(),
        public orientationEuler=new Euler4(
            [0, 0, 0, 0, 0, 0],
            [Plane.Xz, Plane.Yz, Plane.Xy, Plane.Xw, Plane.Yw, Plane.Zw],
        ),
        public distance=1,
    ) {}

    get position() {
        const localForward = this.orientation.inverse().rotateVector(new Vector4(0, 0, -1, 0));
        return this.center.add(localForward.scaled(this.distance));
    }

    get orientation() {
        return this.orientationEuler.asRotor();
    }

    computeTransform() {
        return new Transform4(
            this.position,
            this.orientation,
        );
    }

    pan(deltaX: number, deltaY: number) {
        const localRight = this.orientation.inverse().rotateVector(new Vector4(1, 0, 0, 0));
        const localUp = this.orientation.inverse().rotateVector(new Vector4(0, 1, 0, 0));

        this.center = this.center
                .add(localRight.scaled(-deltaX * this.distance / 1000))
                .add(localUp.scaled(deltaY * this.distance / 1000));
    }

    turn(deltaX: number, deltaY: number) {
        // this.orientation = this.orientation
        //         .mult(Rotor4.planeAngle([0, 1, 0, 0, 0, 0, 0], deltaX / 500))
        //         .mult(Rotor4.planeAngle([0, 0, 0, 1, 0, 0, 0], -deltaY / 500));

        this.orientationEuler.angles[0] += deltaX / 250;
        this.orientationEuler.angles[1] += -deltaY / 250;
    }

    zoom(deltaY: number) {
        this.distance *= 2 ** (deltaY / 1000);
    }
}

export class FirstPerson4 {
    constructor(
        public position: Vector4=new Vector4(),
        public orientation: Rotor4=new Rotor4(),
    ) {}

    pan(deltaX: number, deltaY: number) {
        const localRight = this.orientation.inverse().rotateVector(new Vector4(1, 0, 0, 0));
        const localUp = this.orientation.inverse().rotateVector(new Vector4(0, 1, 0, 0));

        this.position = this.position
                .add(localRight.scaled(-deltaX / 1000))
                .add(localUp.scaled(deltaY / 1000));
    }

    turn(deltaX: number, deltaY: number) {
        this.orientation = this.orientation
                .mult(Rotor4.planeAngle([0, 1, 0, 0, 0, 0, 0], -deltaX / 1000))
                .mult(Rotor4.planeAngle([0, 0, 0, 1, 0, 0, 0], deltaY / 1000));
    }

    dolly(deltaY: number) {
        const localForward = this.orientation.inverse().rotateVector(new Vector4(0, 0, -1, 0));

        this.position = this.position
                .add(localForward.scaled(deltaY / 1000))
    }
}