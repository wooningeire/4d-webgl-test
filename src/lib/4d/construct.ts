import {Vector4} from "./vector";
import {Mesh4} from "./Mesh4";

export const construct = {
    hexahedron() {
        const verts: Vector4[] = [];
        const sqrt1_3 = Math.sqrt(1 / 3);
        const values = [sqrt1_3, -sqrt1_3];
        for (let i = 0; i < 0b1000; i++) {
            verts.push(new Vector4(
                values[0b1 & i],
                values[0b1 & i >>> 1],
                values[0b1 & i >>> 2]));
        }

        return Mesh4.fromVertsFacesCells(verts, [
            // front face
            [0, 1, 3, 2],
            // back face
            [4, 5, 7, 6],
            // left face
            [1, 3, 7, 5],
            // right face
            [0, 2, 6, 4],
            // top face
            [0, 1, 5, 4],
            // bottom face
            [2, 3, 7, 6],
        ]);
    },
    
    octachoron() {
		// General form of cube

		const verts: Vector4[] = pushOctachoronVerts();

		const facesVertIndexes: number[][] = [];

		const cellVertIndexes = [
			[0, 2, 4, 6, 8, 10, 12, 14], // right
			[1, 3, 5, 7, 9, 11, 13, 15], // left
			[0, 1, 4, 5, 8, 9, 12, 13], // top
			[2, 3, 6, 7, 10, 11, 14, 15], // bottom
			[0, 1, 2, 3, 8, 9, 10, 11], // front
			[4, 5, 6, 7, 12, 13, 14, 15], // back
			[0, 1, 2, 3, 4, 5, 6, 7], // kata
			[8, 9, 10, 11, 12, 13, 14, 15], // ana
		];

        const cells: number[][] = [];

		for (const [offset, cell] of cellVertIndexes.entries()) {
            // TODO produces duplicate faces
            facesVertIndexes.push(
                [cell[0], cell[1], cell[3], cell[2]], // right face
                [cell[4], cell[5], cell[7], cell[6]], // left face
                [cell[0], cell[1], cell[5], cell[4]], // bottom face
                [cell[2], cell[3], cell[7], cell[6]], // top face
                [cell[0], cell[2], cell[6], cell[4]], // front face
                [cell[1], cell[3], cell[7], cell[5]], // back face
            );

            cells.push([0, 1, 2, 3, 4, 5].map(faceIndex => faceIndex + 6*offset));
		}

		return Mesh4.fromVertsFacesCells(verts, facesVertIndexes, cells);
    }
};


const pushOctachoronVerts = (verts: Vector4[]=[]) => {
	const values = [.5, -.5];
	for (let i = 0; i < 0b10000; i++) {
		verts.push(new Vector4(
			values[0b1 & i],
			values[0b1 & i >>> 1],
			values[0b1 & i >>> 2], 
			values[0b1 & i >>> 3]));
	}

	return verts;
};