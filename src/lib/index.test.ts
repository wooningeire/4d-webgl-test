import {describe, it, expect} from 'vitest';

expect.extend({
	toHaveCloseElements(received: number[], expected: number[], precision: number=2) {
		// based on built-in `toBeCloseTo` implementation
		const tolerance = 10**-precision / 2;
		return {
			pass: received.every((_, i) =>
					received[i] === Infinity && expected[i] === Infinity
					|| received[i] === -Infinity && expected[i] === -Infinity
					|| Math.abs(expected[i] - received[i]) < tolerance
			),
			message: () => `difference ${this.isNot ? "not " : ""}within tolerance ${tolerance}`,
		};
	},
});

describe('sum test', () => {
	it('adds 1 + 2 to equal 3', () => {
		expect(1 + 2).toBe(3);
	});
});
