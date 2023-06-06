/**
 * Sorts a set (as an array) of vertex indices and represents it as a BigInt. The return value is used to distinguish it in a
 * set or map, similar to a hash code.
 * @param {number[]} vertIndexes 
 * @returns {bigint}
 */
export const numberArrayKey = (vertIndexes: number[]): bigint => {
	const bitsPerComponent = 32n; // arbitrary; can practically be at most 53n (max safe integer for doubles)

	// Sort the array so that facets with the same vertices, but not in the same direction, are no longer distinguished
	const vertIndexesClone = vertIndexes.slice().sort((a, b) => a - b);

	let primitive = BigInt(vertIndexesClone[0]);
	for (let i = 1; i < vertIndexesClone.length; i++) {
		primitive <<= bitsPerComponent;
		primitive += (BigInt(vertIndexesClone[i]) + 1n) % (0b1n << bitsPerComponent); // Add 1 so different-length lists are not considered equal
	}
	
	return primitive;
}