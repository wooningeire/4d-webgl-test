import {describe, expect, it} from "vitest";

import {numberSetKey} from "$/util";

describe.concurrent(numberSetKey.name, () => {
    it("recognizes duplicate integer arrays of the same length", async () => {
        const arrays = [
            [1, 1, 0, 0],
            [0, 1, 2, 3],
            [0, 1, 3, 3],
            [4, 0, 9, 1],
            [1, 1, 0, 0], // !!
            [0, 1, 2, 3], // !!
            [0, 1, 3, 3], // !!
            [0, 1, 3, 3], // !!
            [0, 1, 3, 3], // !!
            [0, 0, 1, 1], // !!
        ];

        const map = new Map<ReturnType<typeof numberSetKey>, number[]>();
        for (const array of arrays) {
            map.set(numberSetKey(array), array)
        }

        expect(map.size).toBe(4);
    });

    it("differentiates integer arrays of different length", async () => {
        const arrays = [
            [0, 0, 0, 1],
            [0, 0, 1],
            [0, 1],
            [1],
        ];

        const map = new Map<ReturnType<typeof numberSetKey>, number[]>();
        for (const array of arrays) {
            map.set(numberSetKey(array), array)
        }

        expect(map.size).toBe(4);
    });
});