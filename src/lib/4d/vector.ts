/**
 * @file Defines mathematical operations regarding vectors and other vector algebra constructs in 4-space, including rotors (orientation).
 * 
 * Acknowledgements:
 * 	- Marc ten Bosch's [primer](https://marctenbosch.com/quaternions/) on rotors, bivectors, and vectors for 3D orientation. Made quaternions a lot more intuitive for me, and gave me the concept of rotors so I didn't have to figure out how octonions could possibly fit into this!
 * 	- Mathoma's [video lectures](https://www.youtube.com/watch?v=iwQlrgAduMg&list=PLpzmRsG7u_gqaTo_vEseQ7U8KFvtiJY4K&index=13) that go a little more in depth about rotors and geometric algebra. Gave a few examples and proofs to fully drive in the geometric algebra techniques and the vectors' behavior!
 */


/**
 * Used to represent general properties of mixed-rank/rank-n vectors.
 */
export class Polymultivector extends Array<number> {
	constructor(elements: number[], length: number=elements.length) {
		super(length || 0);

		this.copy(elements);

		// Prevent new elements from being added
		// Object.seal(this);
	}

	static withLength(length: number): Polymultivector {
		return new this([], length);
	}

	set(...elements: number[]) {
		this.copy(elements);
		return this;
	}

	copy(elements: number[]) {
		// Fill array with given elements or 0s if missing/falsy
		let i = 0;
		while (i < this.length) {
			this[i] = elements?.[i] || 0;
			i++;
		}

		return this;
	}

	slice(start: number, end: number=this.length): number[] {
		const target: number[] = [];
		for (let i = start; i < end; i++) {
			target.push(this[i]);
		}
		return target;
	}

	/**
	 * Multiplies all components by a real number *in place*.
	 * @param {number} scalar 
	 */
	scale(scalar: number) {
		for (let i = 0; i < this.length; i++) {
			this[i] *= scalar;
		}

		return this;
	}

	scaled(scalar: number) {
		return this.map(value => value * scalar) as typeof this;
	}

	normalize() {
		this.scale(1 / this.mag);

		return this;
	}

	/**
	 * Determines whether two polymultivectors have the same values.
	 * @param {Polymultivector} pmvector 
	 * @returns {boolean}
	 */
	eq(pmvector: Polymultivector): boolean {
		if (this.length !== pmvector.length) return false;

		for (let i = 0; i < this.length; i++) {
			if (this[i] !== pmvector[i]) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Determines whether this vector consists of only zeros.
	 * @returns {boolean}
	 */
	isZero(): boolean {
		for (const component of this) {
			if (component !== 0) {
				return false;
			}
		}
		return true;
	}

	sqDist(pmvector: Polymultivector) {
		let sqDist = 0;
		for (let i = 0; i < this.length; i++) {
			sqDist += (this[i] - pmvector[i]) ** 2;
		}
		return sqDist;
	}

	clone(): Polymultivector {
		return new Polymultivector(this);
	}

	/**
	 * Sum of all components squared. Used as a more efficient value for distance comparisons.
	 */ 
	get magSq(): number {
		let cumsum = 0;
		for (const component of this) {
			cumsum += component ** 2;
		}

		return cumsum;
	}

	get mag(): number {
		return Math.sqrt(this.magSq);
	}
}

 /**
 * Sum of the even-rank vectors available in 4-space, together given by the geometric product of two 4D vectors.
 * 
 * Components are stored as coefficients in the order [1, xy, xz, xw, yz, yw, zw, xyzw].
 * 
 * Equivalent to a pair of quaternions, representing rotation in 4D space. It is the 4D analog of a 3D rotor, which is
 * equivalent to a single quaternion.
 * 
 * *Built off of Marc ten Bosch's 3D rotor implementation (https://marctenbosch.com/quaternions/code.htm)*
 */
export class Rotor4 extends Polymultivector {
	/**
	 * Determines the angle of this rotation.
	 * @type number
	 */
	// scalar;
	/**
	 * Determines the plane of this rotation.
	 * @type Bivector4
	 */
	// bivector;

	/**
	 * Coefficient of the rank-4 vector. This only results from multiplying (compositing) 4D rotors with each other and not
	 * from geometric products.
	 * @type number
	 */
	// xyzw;


	/**
	 * Creates a rotor with the given coefficients.
	 * 
	 * @param {number} scalar 
	 * @param {number} xy 
	 * @param {number} xz 
	 * @param {number} xw 
	 * @param {number} yz 
	 * @param {number} yw 
	 * @param {number} zw 
	 * @param {number} xyzw 
	 */
	constructor(scalar: number=1, xy: number=0, xz: number=0, xw: number=0, yz: number=0, yw: number=0, zw: number=0, xyzw: number=0) {
		super([scalar, xy, xz, xw, yz, yw, zw, xyzw]);
	}
	
	/**
	 * Computes the rotor that rotates from `vector0` to `vector1`, two 4D vectors.
	 * 
	 * Fails if the vectors are colinear (in which case there is more than one possible rotor).
	 * @param {Vector4} vector0 
	 * @param {Vector4} vector1 
	 * @returns {Rotor4} 
	 */
	static between(vector0: Vector4, vector1: Vector4): Rotor4 {
		// Why do I need to add 1 to the dot product?
		return this.scalarBivector(1 + vector0.dot(vector1), vector0.outer(vector1)).normalize();
	}

	/**
	 * 
	 * 
	 * @param {number} scalar 
	 * @param {Bivector4} bivector 
	 * @param {number} xyzw 
	 * @returns {Rotor4}
	 */
	static scalarBivector(scalar: number, bivector: Bivector4, xyzw: number=0): Rotor4 {
		return new this(scalar, ...bivector, xyzw);
	}

	/**
	 * 
	 * @param {number[]} axisComponents The [xy, xz, xw, yz, yw, zw, xyzw] basis coefficients comprising the rotor's
	 * plane. The values will be normalized when passed to the rotor.
	 * 
	 * The passed object will not be modified.
	 * @param {number} angle 
	 */
	static planeAngle(axisComponents: number[], angle: number): Rotor4 {
		const axis = new Polymultivector(axisComponents).normalize().scale(Math.sin(angle / 2));

		const rotor = new this(Math.cos(angle / 2), ...axis);
		return rotor.isZero() // Return the identity rotor if the new rotor is all zeros
				? new Rotor4()
				: rotor.normalize();
	}

	static identity(): Rotor4 {
		return new Rotor4();
	}

	inverse(): Rotor4 {
		return new Rotor4(this[0], -this[1], -this[2], -this[3], -this[4], -this[5], -this[6], this[7]);
	}

	/**
	 * Multiplies this rotor by a given rotor.
	 * 
	 * Used to bundle multiple rotations into a single rotor.
	 * @param {Rotor4} rotor
	 * @returns {Rotor4}  
	 */
	mult(rotor: Rotor4): Rotor4 {
		// The formula below is derived by representing the bivectors in standard unit vector form and then
		// distributing

		const r0 = this;
		const r1 = rotor;

		return new Rotor4(
			+ r0[0]*r1[0] - r0[1]*r1[1] - r0[2]*r1[2] - r0[3]*r1[3] - r0[4]*r1[4] - r0[5]*r1[5] - r0[6]*r1[6] + r0[7]*r1[7], // 1
			+ r0[0]*r1[1] + r0[1]*r1[0] - r0[2]*r1[4] - r0[3]*r1[5] + r0[4]*r1[2] + r0[5]*r1[3] - r0[6]*r1[7] - r0[7]*r1[6], // XY
			+ r0[0]*r1[2] + r0[1]*r1[4] + r0[2]*r1[0] - r0[3]*r1[6] - r0[4]*r1[1] + r0[5]*r1[7] + r0[6]*r1[3] + r0[7]*r1[5], // XZ
			+ r0[0]*r1[3] + r0[1]*r1[5] + r0[2]*r1[6] + r0[3]*r1[0] - r0[4]*r1[7] - r0[5]*r1[1] - r0[6]*r1[2] - r0[7]*r1[4], // XW
			+ r0[0]*r1[4] - r0[1]*r1[2] + r0[2]*r1[1] - r0[3]*r1[7] + r0[4]*r1[0] - r0[5]*r1[6] + r0[6]*r1[5] - r0[7]*r1[3], // YZ
			+ r0[0]*r1[5] - r0[1]*r1[3] + r0[2]*r1[7] + r0[3]*r1[1] + r0[4]*r1[6] + r0[5]*r1[0] - r0[6]*r1[4] + r0[7]*r1[2], // YW
			+ r0[0]*r1[6] - r0[1]*r1[7] - r0[2]*r1[3] + r0[3]*r1[2] - r0[4]*r1[5] + r0[5]*r1[4] + r0[6]*r1[0] - r0[7]*r1[1], // ZW
			+ r0[0]*r1[7] + r0[1]*r1[6] - r0[2]*r1[5] + r0[3]*r1[4] + r0[4]*r1[3] - r0[5]*r1[2] + r0[6]*r1[1] + r0[7]*r1[0], // XYZW
		);
	}

	/**
	 * Applies this rotor onto a 4D vector.
	 * 
	 * @param {Vector4} vector The starting vector, which will not be modified.
	 * @returns {Vector4} A new 4D vector with the rotation applied.
	 */
	rotateVector(vector: Vector4): Vector4 {
		// Rotating a vector with a rotor is a matter of premultiplying the vector and the rotor's inverse, then
		// postmultiplying the result with the rotor
		// The formula below is derived by representing the rank-N vectors in standard unit vector form and then
		// distributing

		// Multiplying a rotor's inverse by a vector gives a rank-1 vector added to a rank-3 vector

		const r0 = this.inverse();
		const v0 = vector;

		const v1 = [
			+ r0[0]*v0[0] + r0[1]*v0[1] + r0[2]*v0[2] + r0[3]*v0[3], // X
			+ r0[0]*v0[1] - r0[1]*v0[0] + r0[4]*v0[2] + r0[5]*v0[3], // Y
			+ r0[0]*v0[2] - r0[2]*v0[0] - r0[4]*v0[1] + r0[6]*v0[3], // Z
			+ r0[0]*v0[3] - r0[3]*v0[0] - r0[5]*v0[1] - r0[6]*v0[2], // W

			+ r0[1]*v0[2] - r0[2]*v0[1] + r0[4]*v0[0] + r0[7]*v0[3], // XYZ
			+ r0[1]*v0[3] - r0[3]*v0[1] + r0[5]*v0[0] - r0[7]*v0[2], // XYW
			+ r0[2]*v0[3] - r0[3]*v0[2] + r0[6]*v0[0] + r0[7]*v0[1], // XZW
			+ r0[4]*v0[3] - r0[5]*v0[2] + r0[6]*v0[1] - r0[7]*v0[0], // YZW
		];

		// Multiplying the previous construct by the rotor gives back a vector (all rank-3 coefficients cancel)
		
		const r1 = this;

		return new Vector4(
			+ v1[0]*r1[0] - v1[1]*r1[1] - v1[2]*r1[2] - v1[3]*r1[3] - v1[4]*r1[4] - v1[5]*r1[5] - v1[6]*r1[6] + v1[7]*r1[7], // X
			+ v1[0]*r1[1] + v1[1]*r1[0] - v1[2]*r1[4] - v1[3]*r1[5] + v1[4]*r1[2] + v1[5]*r1[3] - v1[6]*r1[7] - v1[7]*r1[6], // Y
			+ v1[0]*r1[2] + v1[1]*r1[4] + v1[2]*r1[0] - v1[3]*r1[6] - v1[4]*r1[1] + v1[5]*r1[7] + v1[6]*r1[3] + v1[7]*r1[5], // Z
			+ v1[0]*r1[3] + v1[1]*r1[5] + v1[2]*r1[6] + v1[3]*r1[0] - v1[4]*r1[7] - v1[5]*r1[1] - v1[6]*r1[2] - v1[7]*r1[4], // W
		);
	}

	/**
	 * Performs a spherical linear interpolation between this rotor and another.
	 * 
	 * *Formula provided by https://en.wikipedia.org/wiki/Slerp*
	 * probably not necessary until keyframe animation
	 * @param {Rotor4} rotor 
	 * @param {number} time 
	 *
	 */
	slerp(rotor: Rotor4, time: number) {
		
	}
	

	clone(): Rotor4 {
		return new Rotor4(...this);
	}

	asAnglePlane(): number[] {
		return [this.angle, ...this.plane];
	}

	get angle(): number {
		return 2 * Math.acos(this[0]);
	}

	get plane(): Polymultivector {
		// `slice` by default would return a `Rotor4`
		return new Polymultivector([this[1], this[2], this[3], this[4], this[5], this[6], this[7]]).scale(1 / Math.sin(this.angle / 2));
	}
}

/**
 * Rank-2 (2D-array-like) vector, given by the outer product of two 4D vectors.
 * 
 * Components are stored in the order [xy, xz, xw, yz, yw, zw].
 * 
 * Unlike a rank-1 vector, its components represent areas and not lengths. This allows it to represent a plane. WHen
 * added with a scalar, it can represent a rotation angle across this plane.
 * 
 * The plane is not represented as a mathematical object in this circumstance; rotation across a plane occurs when
 * multiplying a rotor by a vector or other rotor.
 */
export class Bivector4 extends Polymultivector {
	/**
	 * [0] :: xy
	 * [1] :: xz
	 * [2] :: xw
	 * [3] :: yz
	 * [4] :: yw
	 * [5] :: zw
	 */

	constructor(xy: number, xz: number, xw: number, yz: number, yw: number, zw: number) {
		super([xy, xz, xw, yz, yw, zw]);
	}

	/**
	 * Computes and returns the additive inverse of this vector. Achievable by swapping the order of the vectors in the
	 * outer product used to generate it.
	 * @returns {Bivector4}
	 */
	opposite(): Bivector4 {
		return new Bivector4(-this[0], -this[1], -this[2], -this[3], -this[4], -this[5]);
	}

	/**
	 * 
	 * @param {Bivector4} bivector 
	 * @returns {number} 
	 */
	dot(bivector: Bivector4): number {
		let cumsum = 0;
		for (let i = 0; i < this.length; i++) {
			cumsum += this[i] * bivector[i];
		}
		return cumsum;
	}

	get xy() {
		return this[0];
	}

	get xz() {
		return this[1];
	}

	get xw() {
		return this[2];
	}

	get yz() {
		return this[3];
	}

	get yw() {
		return this[4];
	}

	get zw() {
		return this[5];
	}
}

/**
 * Rank-1 vector with 4 components, one for each dimension in 4D. 
 */
export class Vector4 extends Polymultivector {
	/**
	 * [0] :: x
	 * [1] :: y
	 * [2] :: z
	 * [3] :: w
	 */

	/**
	 * 
	 * @param {number} x 
	 * @param {number} y 
	 * @param {number} z 
	 * @param {number} w 
	 */
	constructor(x: number=0, y: number=0, z: number=0, w: number=0) {
		super([x, y, z, w]);
	}

	static zero(): Vector4 {
		return new Vector4();
	}

	static ones(): Vector4 {
		return new Vector4(1, 1, 1, 1);
	}

	static basis(axisIndex: number): Vector4 {
		const out = new Vector4();
		out[axisIndex] = 1;
		return out;
	}

	/**
	 * 
	 * @param {Vector4} vector 
	 * @returns {number} 
	 */
	dot(vector: Vector4): number {
		let cumsum = 0;
		for (let i = 0; i < this.length; i++) {
			cumsum += this[i] * vector[i];
		}
		return cumsum;
	}

	/**
	 * 
	 * @param {Vector4} vector 
	 * @returns {Bivector4} 
	 */
	outer(vector: Vector4): Bivector4 {
		return new Bivector4(
			this[0] * vector[1] - vector[0] * this[1], // XY
			this[0] * vector[2] - vector[0] * this[2], // XZ
			this[0] * vector[3] - vector[0] * this[3], // XW
			this[1] * vector[2] - vector[1] * this[2], // YZ
			this[1] * vector[3] - vector[1] * this[3], // YW
			this[2] * vector[3] - vector[2] * this[3], // ZW
		);
	}
	
	// https://hollasch.github.io/ray4/Four-Space_Visualization_of_4D_Objects.html
	cross(vector0: Vector4, vector1: Vector4): Vector4 {
		// Gives all the necessary determinants (intermediary matrix implicit)
		const bivector = vector0.outer(vector1);

		return new Vector4(
			+ (this[1] * bivector[5]) - (this[2] * bivector[4]) + (this[3] * bivector[3]),
			- (this[0] * bivector[5]) + (this[2] * bivector[2]) - (this[3] * bivector[1]),
			+ (this[0] * bivector[4]) - (this[1] * bivector[2]) + (this[3] * bivector[0]),
			- (this[0] * bivector[3]) + (this[1] * bivector[1]) - (this[2] * bivector[0]),
		);
	}

	add(vector: Vector4): Vector4 {
		return new Vector4(
			this[0] + vector[0],
			this[1] + vector[1],
			this[2] + vector[2],
			this[3] + vector[3],
		);
	}

	subtract(vector: Vector4): Vector4 {
		return new Vector4(
			this[0] - vector[0],
			this[1] - vector[1],
			this[2] - vector[2],
			this[3] - vector[3],
		);
	}
	
	multScalar(scalar: number): Vector4 {
		return new Vector4(
			this[0] * scalar,
			this[1] * scalar,
			this[2] * scalar,
			this[3] * scalar,
		);
	}

	multComponentwise(vector: Vector4): Vector4 {
		return new Vector4(
			this[0] * vector[0],
			this[1] * vector[1],
			this[2] * vector[2],
			this[3] * vector[3],
		);
	}

	/**
	 * 
	 * @param {Rotor4} rotor
	 * @returns {Vector4} 
	 */
	multRotor(rotor: Rotor4): Vector4 {
		return rotor.rotateVector(this);
	}

	/**
	 * @param {Vector4} vector
	 * @returns {Vector4}
	 */
	multComponents(vector: Vector4): Vector4 {
		return new Vector4(
			this[0] * vector[0],
			this[1] * vector[1],
			this[2] * vector[2],
			this[3] * vector[3],
		);
	}

	// https://math.stackexchange.com/questions/3174534/how-to-take-dot-product-of-a-vector-and-a-bivector
	dotBivec(bivector: Bivector4): Vector4 {
		// Components of the vector can be found by evaluating the right side of the bac-cab identity and then
		// pattern-matching with the left side
		return new Vector4(
			-this.y * bivector.xy - this.z * bivector.xz - this.w * bivector.xw,
			this.x * bivector.xy - this.z * bivector.yz - this.w * bivector.yw,
			this.x * bivector.xz + this.y * bivector.yz - this.w * bivector.zw,
			this.x * bivector.xw + this.y * bivector.yw + this.z * bivector.zw,
		);
	}

	dist(vector: Vector4): number {
		return Math.hypot(...vector.subtract(this));
	}

	clone(): Vector4 {
		return new Vector4(...this);
	}

	get x(): number {
		return this[0];
	}

	get y(): number {
		return this[1];
	}

	get z(): number {
		return this[2];
	}

	get w(): number {
		return this[3];
	}
}

/**
 * A 5×5 matrix.
 */
export class Matrix5 extends Array {
	/**
	 * 
	 * @param {number[][]} columns 
	 */
	constructor(columns: number[][]) {
		super(5);

		this.copy(columns);

		Object.seal(this);
	}

	static fromTranslation(offset: number[]) {
		return new Matrix5([
			[1, 0, 0, 0, offset[0]],
			[0, 1, 0, 0, offset[1]],
			[0, 0, 1, 0, offset[2]],
			[0, 0, 0, 1, offset[3]],
			[0, 0, 0, 0, 1],
		]);
	}

	/**
	 * 
	 * @param {number[][]} columns 
	 */
	copy(columns: number[][]) {
		let i = 0;
		while (i < this.length) {
			const column = new Polymultivector(columns?.[i], this.length);
			if (columns?.[i]?.[i] === undefined) {
				column[i] = 1; // Fill with identity matrix value if the provided column does not extend this far
			}
			
			this[i] = column;
			i++;
		}
		return this;
	}

	clone() {
		return new Matrix5(this.map(column => column.clone()));
	}

	/* determinant() {
		return matrixWrapper(this).det();
	}

	inverse() {
		return new Matrix5(matrixWrapper(this).inv());
	}

	mult(matrix: any) {
		return new Matrix5(matrixWrapper(this).prod(matrixWrapper(matrix)));
	} */

	/**
	 * Calculates the dot product of a homogeneous `Vector4` and a column from this matrix.
	 * @param {Vector4} vector The vector to dot with.
	 * @param {number} columnIndex Index of the column to dot with.
	 * @returns 
	 */
	dot4WithColumn(vector: Vector4, columnIndex: number) {
		let cumsum = 0;

		const column = this[columnIndex];
		for (let i = 0; i < column.length; i++) {
			cumsum += (vector?.[i] ?? 1) * column[i];
		}

		return cumsum;
	}
}

/**
 * Represents a 3-space that exists in 4-space.
 */
export class Space3_4 {
	/**
	 * A vector that is orthogonal to this 3-space.
	 */
	normal: Vector4;

	/**
	 * A point that lies within this 3-space.
	 */
	offset: Vector4;

	constructor(normal: Vector4, offset=new Vector4()) {
		this.normal = normal;
		this.offset = offset;
	}

	/**
	 * 
	 * 
	 * Formula from https://en.wikipedia.org/wiki/Line%E2%80%93plane_intersection#Algebraic_form
	 * @param {Line4} line 
	 * @returns {number} The scalar that the line may be evaluated at to produce the point of intersection, or
	 * `±Infinity` if there is no intersection, or `NaN` if there are infinitely many points of intersection
	 * (the line lies within this 3-space).
	 */
	intersectWithLine(line: Line4): number {
		return this.offset.subtract(line.offset).dot(this.normal) / line.direction.dot(this.normal);
	}

	/**
	 * 
	 * @param {Line4} line 
	 * @returns {Vector4} The point of intersection between this 3-space and the line, with edge case values
	 * according to `intersectWithLine`.
	 */
	intersectionWithLine(line: Line4): Vector4 {
		return line.evaluate(this.intersectWithLine(line));
	}
}

/**
 * Represents a 1-space, or line, that exists in 4-space.
 * 
 * Can be represented as vectors in the form `(this.offset) + (this.direction) * scalar`, where `scalar` is any real number.
 */
export class Line4 {
	/**
	 * A vector that points in the direction of this line.
	 */
	direction: Vector4;

	/**
	 * A point that lies within this 1-space.
	 */
	offset: Vector4;

	constructor(direction: Vector4, offset: Vector4=new Vector4()) {
		this.direction = direction;
		this.offset = offset;
	}

	/**
	 * Evaluates this line using the vector form `(this.offset) + (this.direction) * scalar` to produce a point.
	 * @param {number} scalar 
	 * @returns {Vector4} 
	 */
	evaluate(scalar: number): Vector4 {
		return this.offset.add(this.direction.multScalar(scalar));
	}
}