/**
 * Sorts a set (as an array) of vertex indices and represents it as a BigInt. The return value is used to distinguish it in a
 * set or map, similar to a hash code.
 * @param {number[]} vertIndices 
 * @returns {bigint}
 */
export const numberSetKey = (vertIndices: number[]): bigint => {
	const bitsPerComponent = 32n; // arbitrary; can practically be at most 53n (max safe integer for doubles)

	// Sort the array so that facets with the same vertices, but not in the same direction, are no longer distinguished
	const vertIndicesClone = vertIndices.slice().sort((a, b) => a - b);

	let primitive = BigInt(vertIndicesClone[0]);
	for (let i = 1; i < vertIndicesClone.length; i++) {
		primitive <<= bitsPerComponent;
		primitive += (BigInt(vertIndicesClone[i]) + 1n) % (0b1n << bitsPerComponent); // Add 1 so different-length lists are not considered equal
	}
	
	return primitive;
};

// https://stackoverflow.com/a/52490977
// Start the accumulator with 0 elements
/* export type NLengthTuple<T, Length extends number> = NLengthTupleBuilder<T, Length, []>;

type NLengthTupleBuilder<T, TargetLength extends number, AccumulatorTuple extends T[]> =
        AccumulatorTuple["length"] extends TargetLength
                // When the accumulator has the desired length, return it as the tuple type
                ? AccumulatorTuple
                // Otherwise, extend the accumulator by one entry and check again
                : NLengthTupleBuilder<T, TargetLength, [...AccumulatorTuple, T]>; */

/**
 * An `N`-element tuple of `T`.
 */
export type Multiple<N extends number, T> = T[] & {length: N};


export const mod = (a: number, b: number) => (a % b + b) % b;