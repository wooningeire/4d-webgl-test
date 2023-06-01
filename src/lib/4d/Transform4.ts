import {Rotor4, Vector4} from "./vector";

/**
 * Column-major (i.e., indices 0–5 are column 1, etc.)
 */
export class Matrix5 extends Array<number> {
    constructor(...elements: number[]) {
        super(25);

		this.copy(elements);
    }

	copy(elements: number[]) {
		for (let i = 0; i < this.length; i++) {
			this[i] = elements?.[i] ?? 0;
		}

		return this;
	}

    dotMat(matrix: Matrix5) {
        const newMat = new Matrix5();

        // Dot product definition of matrix multiplication
        for (let nCell = 0; nCell < 25; nCell++) {
            const nRow1 = nCell % 5;
            const nCol2 = Math.floor(nCell / 5);

            for (let i = 0; i < 5; i++) {
                newMat[nCell] += this[nRow1 + 5*i] * matrix[5*nCol2 + i];
            }
        }

        return newMat;
    }
}

export class Transform4 {
    constructor(
        public translate: Vector4=new Vector4(0, 0, 0, 0),
        public rotate: Rotor4=new Rotor4(1, 0, 0, 0, 0, 0, 0, 0),
        public scale: Vector4=new Vector4(1, 1, 1, 1),
    ) {}

    private rotateAndScale(vector: Vector4): Vector4 {
        return vector.multRotor(this.rotate)
                .multComponentwise(this.scale);
    }

    private inverseScaleAndRotate(vector: Vector4): Vector4 {
        return vector.multComponentwise(this.scale)
                .multRotor(this.rotate.inverse());
    }

    matrix(): Matrix5 {
        // Construct matrix by transforming each basis vector
        return new Matrix5(
            ...this.rotateAndScale(new Vector4(1, 0, 0, 0)), 0,
            ...this.rotateAndScale(new Vector4(0, 1, 0, 0)), 0,
            ...this.rotateAndScale(new Vector4(0, 0, 1, 0)), 0,
            ...this.rotateAndScale(new Vector4(0, 0, 0, 1)), 0,
            ...this.translate, 1,
        );
    }

    matrixInverse() {
        return new Matrix5(
            ...this.inverseScaleAndRotate(new Vector4(1, 0, 0, 0)), -this.translate[0],
            ...this.inverseScaleAndRotate(new Vector4(0, 1, 0, 0)), -this.translate[1],
            ...this.inverseScaleAndRotate(new Vector4(0, 0, 1, 0)), -this.translate[2],
            ...this.inverseScaleAndRotate(new Vector4(0, 0, 0, 1)), -this.translate[3],
            0, 0, 0, 0, 1,
        );
    }
}