import {Rotor4, Vector4} from "./vector";

/**
 * Column-major (i.e., indices 0–5 are column 1, etc.)
 */
export class Matrix5 extends Array<number> {
    static readonly N_ROWS = 5;
    static readonly N_COLS = 5;
    static readonly N_CELLS = this.N_ROWS * this.N_COLS;

    constructor(...elements: number[]) {
        super(Matrix5.N_CELLS);

		this.copy(elements);
    }
    
    static identity(): Matrix5 {
        return new Matrix5(
            1, 0, 0, 0, 0,
            0, 1, 0, 0, 0,
            0, 0, 1, 0, 0,
            0, 0, 0, 1, 0,
            0, 0, 0, 0, 1,
        );
    }
    

	copy(elements: number[]) {
		for (let i = 0; i < this.length; i++) {
			this[i] = elements?.[i] ?? 0;
		}

		return this;
	}

    dotMat(matrix: Matrix5) {
        const newMat = new Matrix5();

        // Derived from dot product definition of matrix multiplication
        for (let nCell = 0; nCell < Matrix5.N_CELLS; nCell++) {
            const nRow1 = nCell % Matrix5.N_ROWS;
            const nCol2 = Math.floor(nCell / Matrix5.N_ROWS);

            for (let i = 0; i < Matrix5.N_ROWS; i++) {
                newMat[nCell] += this.cell(i, nRow1) * matrix.cell(nCol2, i);
            }
        }

        return newMat;
    }

    inv(): Matrix5 {
        // Derived using Gauss–Jordan elimination with a superaugmented matrix
        const left = this.clone();
        const right = Matrix5.identity();

        // Enumerate through each diagonal of the left matrix
        for (let nDiagonal = 0; nDiagonal < Matrix5.N_COLS; nDiagonal++) {
            const diagonalValue = left.cell(nDiagonal, nDiagonal);
        
            // Scale the row that contains this diagonal so that the diagonal becomes 1
            for (let nCol = 0; nCol < Matrix5.N_COLS; nCol++) {
                left.set(nCol, nDiagonal, left.cell(nCol, nDiagonal) / diagonalValue);
                right.set(nCol, nDiagonal, right.cell(nCol, nDiagonal) / diagonalValue);
            }

            // Enumerate through the remaining rows
            for (let nRow = 0; nRow < Matrix5.N_ROWS; nRow++) {
                if (nRow === nDiagonal) continue;

                // Subtract a multiple of the row containing the current diagonal so that the pivot cell becomes 0
                const cancellationFactor = left.cell(nDiagonal, nRow);
                for (let nCol = 0; nCol < Matrix5.N_COLS; nCol++) {
                    left.set(nCol, nRow, left.cell(nCol, nRow) - left.cell(nCol, nDiagonal) * cancellationFactor);
                    right.set(nCol, nRow, right.cell(nCol, nRow) - right.cell(nCol, nDiagonal) * cancellationFactor);
                }
            }
        }

        return right;
    }

    cell(nCol: number, nRow: number): number {
        return this[Matrix5.N_ROWS*nCol + nRow];
    }
    set(nCol: number, nRow: number, value: number) {
        this[Matrix5.N_ROWS*nCol + nRow] = value;
        return this;
    }

    clone(): Matrix5 {
        return new Matrix5(...this);
    }
}

export class Transform4 {
    constructor(
        public translate: Vector4=Vector4.zero(),
        public rotate: Rotor4=Rotor4.identity(),
        public scale: Vector4=Vector4.ones(),
    ) {}

    private rotateAndScale(vector: Vector4): Vector4 {
        return vector.multRotor(this.rotate)
                .multComponentwise(this.scale);
    }

    private inverseScaleAndRotate(vector: Vector4): Vector4 {
        return vector.multComponentwise(this.scale.map(x => 1/x) as Vector4)
                .multRotor(this.rotate.inverse());
    }

    private matrixRotation() {
        return new Matrix5(
            ...new Vector4(1, 0, 0, 0).multRotor(this.rotate), 0,
            ...new Vector4(0, 1, 0, 0).multRotor(this.rotate), 0,
            ...new Vector4(0, 0, 1, 0).multRotor(this.rotate), 0,
            ...new Vector4(0, 0, 0, 1).multRotor(this.rotate), 0,
            0, 0, 0, 0, 1,
        );
    }

    private matrixScale() {
        return new Matrix5(
            this.scale[0], 0, 0, 0, 0,
            0, this.scale[1], 0, 0, 0,
            0, 0, this.scale[2], 0, 0,
            0, 0, 0, this.scale[3], 0,
            0, 0, 0, 0, 1,
        );
    }

    matrix(): Matrix5 {
        // Construct matrix by transforming each basis vector
        return new Matrix5(
            ...this.rotateAndScale(new Vector4(1, 0, 0, 0)), this.translate[0],
            ...this.rotateAndScale(new Vector4(0, 1, 0, 0)), this.translate[1],
            ...this.rotateAndScale(new Vector4(0, 0, 1, 0)), this.translate[2],
            ...this.rotateAndScale(new Vector4(0, 0, 0, 1)), this.translate[3],
            0, 0, 0, 0, 1,
        );
    }

    matrixOrthographic(): Matrix5 {
        return new Matrix5(
            ...this.rotateAndScale(new Vector4(1, 0, 0, 0)), this.translate[0],
            ...this.rotateAndScale(new Vector4(0, 1, 0, 0)), this.translate[1],
            ...this.rotateAndScale(new Vector4(0, 0, 1, 0)), this.translate[2],
            ...this.rotateAndScale(new Vector4(0, 0, 0, 1)), this.translate[3],
            0, 0, 0, 1, 0,
        );
    }

    matrixInverse() {
        return this.matrix().inv();
        // return new Matrix5(
        //     ...this.inverseScaleAndRotate(new Vector4(1, 0, 0, 0)), -this.translate[0],
        //     ...this.inverseScaleAndRotate(new Vector4(0, 1, 0, 0)), -this.translate[1],
        //     ...this.inverseScaleAndRotate(new Vector4(0, 0, 1, 0)), -this.translate[2],
        //     ...this.inverseScaleAndRotate(new Vector4(0, 0, 0, 1)), -this.translate[3],
        //     0, 0, 0, 0, 1,
        // );
    }

    matrixOrthographicInverse() {
        return this.matrixOrthographic().inv();
    }

    transformVec(vector: Vector4): Vector4 {
        return this.rotateAndScale(vector).add(this.translate);
    }

    transformVecInverse(vector: Vector4): Vector4 {
        return this.inverseScaleAndRotate(vector).subtract(this.translate);
    }
}