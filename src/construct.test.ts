import {describe, expect, it} from "vitest";
import {construct} from "./lib/4d/construct";

describe.concurrent(construct.regularPentachoron.name, () => {
    it("produces the correct number of facets", () => {
        const mesh = construct.regularPentachoron();

        expect(mesh.verts.length).toBe(5);
        expect(mesh.edges.length).toBe(10);
        expect(mesh.faces.length).toBe(10);
        expect(mesh.cells.length).toBe(5);
    });
});

describe.concurrent(construct.regularOctachoron.name, () => {
    it("produces the correct number of facets", () => {
        const mesh = construct.regularOctachoron();

        expect(mesh.verts.length).toBe(16);
        expect(mesh.edges.length).toBe(32);
        expect(mesh.faces.length).toBe(24);
        expect(mesh.cells.length).toBe(8);
    });
});

describe.concurrent(construct.regularHexadecachoron.name, () => {
    it("produces the correct number of facets", () => {
        const mesh = construct.regularHexadecachoron();

        expect(mesh.verts.length).toBe(8);
        expect(mesh.edges.length).toBe(24);
        expect(mesh.faces.length).toBe(32);
        expect(mesh.cells.length).toBe(16);
    });
});

describe.concurrent(construct.regularIcositetrachoron.name, () => {
    it("produces the correct number of facets", () => {
        const mesh = construct.regularIcositetrachoron();

        expect(mesh.verts.length).toBe(24);
        expect(mesh.edges.length).toBe(96);
        expect(mesh.faces.length).toBe(96);
        expect(mesh.cells.length).toBe(24);
    });
});

describe.concurrent(construct.regularHexacosichoron.name, () => {
    it("produces the correct number of facets", () => {
        const mesh = construct.regularHexacosichoron();

        expect(mesh.verts.length).toBe(120);
        expect(mesh.edges.length).toBe(720);
        expect(mesh.faces.length).toBe(1200);
        expect(mesh.cells.length).toBe(600);
    });
});