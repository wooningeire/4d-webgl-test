import { Transform4 } from "@/lib/4d/Transform4";
import { Vector4, Rotor4 } from "@/lib/4d/vector";

/**
 * An `N`-element tuple of `T`.
 */
type Multiple<N extends number, T> = T[] & {length: N};

enum Plane {
    Xy = 0,
    Xz = 1,
    Xw = 2,
    Yz = 3,
    Yw = 4,
    Zw = 5,
}
class Euler4 {
    static readonly Plane = Plane;

    constructor(
        public angles: Multiple<6, number>,
        public angleOrdering: Multiple<6, Plane>,
    ) {}

    asRotor(): Rotor4 {
        let rotor = new Rotor4();
        
        for (let i = 0; i < 6; i++) {
            const plane = [0, 0, 0, 0, 0, 0];
            plane[this.angleOrdering[i]] = 1;

            rotor = rotor.mult(Rotor4.planeAngle(plane, this.angles[i]));
        }

        return rotor;
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