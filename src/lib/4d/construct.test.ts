import {describe, expect, it, test} from "vitest";
import {construct} from "./construct";

describe.concurrent("construct", () => {
    test(`${construct.regularPentachoron.name} produces the correct number of facets`, () => {
        const mesh = construct.regularPentachoron();

        expect(mesh.verts.length).toBe(5);
        expect(mesh.edges.length).toBe(10);
        expect(mesh.faces.length).toBe(10);
        expect(mesh.cells.length).toBe(5);
    });

    test(`${construct.regularOctachoron.name} produces the correct number of facets`, () => {
        const mesh = construct.regularOctachoron();

        expect(mesh.verts.length).toBe(16);
        expect(mesh.edges.length).toBe(32);
        expect(mesh.faces.length).toBe(24);
        expect(mesh.cells.length).toBe(8);
    });

    test(`${construct.regularHexadecachoron.name} produces the correct number of facets`, () => {
        const mesh = construct.regularHexadecachoron();

        expect(mesh.verts.length).toBe(8);
        expect(mesh.edges.length).toBe(24);
        expect(mesh.faces.length).toBe(32);
        expect(mesh.cells.length).toBe(16);
    });

    test(`${construct.regularIcositetrachoron.name} produces the correct number of facets`, () => {
        const mesh = construct.regularIcositetrachoron();

        expect(mesh.verts.length).toBe(24);
        expect(mesh.edges.length).toBe(96);
        expect(mesh.faces.length).toBe(96);
        expect(mesh.cells.length).toBe(24);
    });

    test(`${construct.regularHecatonicosachoron.name} produces the correct number of facets`, () => {
        const mesh = construct.regularHecatonicosachoron();

        expect(mesh.verts.length).toBe(600);
        expect(mesh.edges.length).toBe(1200);
        expect(mesh.faces.length).toBe(720);
        expect(mesh.cells.length).toBe(120);
    });

    test(`${construct.regularHexacosichoron.name} produces the correct number of facets`, () => {
        const mesh = construct.regularHexacosichoron();

        expect(mesh.verts.length).toBe(120);
        expect(mesh.edges.length).toBe(720);
        expect(mesh.faces.length).toBe(1200);
        expect(mesh.cells.length).toBe(600);
    });
});