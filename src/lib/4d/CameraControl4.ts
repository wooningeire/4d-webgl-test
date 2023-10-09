import { Transform4 } from "@/lib/4d/Transform4";
import { Vector4, Rotor4 } from "@/lib/4d/vector";

export class Orbit4 {
    constructor(
        public center: Vector4=new Vector4(),
        public orientation: Rotor4=new Rotor4(),
        public distance=1,
    ) {}

    computeTransform() {
        const localForward = this.orientation.inverse().rotateVector(new Vector4(0, 0, -1, 0));
        return new Transform4(
            this.center.add(localForward.scaled(this.distance)),
            this.orientation,
        );
    }

    pan(deltaX: number, deltaY: number) {
        const localLeft = this.orientation.inverse().rotateVector(new Vector4(1, 0, 0, 0));
        const localUp = this.orientation.inverse().rotateVector(new Vector4(0, 1, 0, 0));

        this.center = this.center
                .add(localLeft.scaled(-deltaX * this.distance / 1000))
                .add(localUp.scaled(deltaY * this.distance / 1000));
    }
}