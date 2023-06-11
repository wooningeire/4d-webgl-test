<script lang="ts">
import {onMount} from "svelte";

import {Gl} from "./Gl";
import {Transform4} from "$/4d/Transform4";
import {Bivector4, Rotor4, Vector4} from "$/4d/vector";
import {construct} from "$/4d/construct";

import vertexShaderSource from "./vertex.glsl?raw";
import fragmentShaderMeshSource from "./fragment_mesh.glsl?raw";
import fragmentShaderLineSource from "./fragment_line.glsl?raw";
    import { Mesh4 } from "@/lib/4d/Mesh4";

let canvas: HTMLCanvasElement;

let resizeCanvasAndViewport = () => {};


onMount(() => {
    const gl = canvas.getContext("webgl2", {
        alpha: true,
        premultipliedAlpha: false,
    })!;

    const gle = new Gl(gl);

    gl.enable(gl.DEPTH_TEST); // Automatic depth
    // gl.enable(gl.CULL_FACE); // Backface culling
    
    // Alpha blending
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // gl.enable(gl.BLEND);


    //#region Shader setup

    const vertexShader = gle.vertexShader(vertexShaderSource);
    const fragmentShaderMesh = gle.fragmentShader(fragmentShaderMeshSource);
    const glProgramMesh = gle.program(vertexShader, fragmentShaderMesh);

    const fragmentShaderLine = gle.fragmentShader(fragmentShaderLineSource);
    const glProgramLine = gle.program(vertexShader, fragmentShaderLine);

    //#endregion

    const mesh = construct.regularHexacosichoron()
            // .transform(new Transform4(
            //     new Vector4(0, 0, 0, 0),
            //     Rotor4.planeAngle(new Vector4(0, 0, 0, 1).outer(new Vector4(1, 0, 0, 0)), Math.PI * 0)
            // ))
            .intersection();

    // const mesh = (() => {
    //     const cube = Mesh4.fromVertsFacesCells(
    //         [
    //             new Vector4(0, 0, 1, 0),
    //             new Vector4(-1, -1, 0, 0),
    //             new Vector4(-2, 2, -1, 0),
    //             new Vector4(0, 0, 0, 1),
    //         ], [
    //             [0, 1, 2],
    //             [0, 1, 3],
    //             [0, 2, 3],
    //             [1, 2, 3],
    //         ], [
    //             [0, 1, 2, 3],
    //         ],
    //     );
    //     cube.cells.push(cube.faces);
    //     const intersect = cube
    //             // .transform(new Transform4(
    //             //     new Vector4(0, 0, 0, 0),
    //             //     Rotor4.planeAngle(new Vector4(0, 0, 1, 0).outer(new Vector4(0, 0, 0, 1)), Math.PI / 2)
    //             //             .mult(Rotor4.between(new Vector4(1, 1, 0, 1), new Vector4(0, 0, -1, 0)))
    //             // ))
    //             .intersection();

    //     return intersect
    //             // .joinEdges(construct.regularHexahedron()
    //             // .transform(new Transform4(
    //             //     new Vector4(0, 0, 0, 0),
    //             //     Rotor4.planeAngle(new Vector4(0, 0, 1, 0).outer(new Vector4(0, 0, 0, 1)), Math.PI / 2)
    //             //             .mult(Rotor4.between(new Vector4(1, 1, 0, 1), new Vector4(0, 0, -1, 0)))
    //             // )))
    // })();

    console.log(mesh.verts.length, mesh.edges.length, mesh.faces.length);

    //#region Setting attributes

    const vertArrayMesh = gl.createVertexArray();
    gl.bindVertexArray(vertArrayMesh);

    const vertCoordsMesh = new Float32Array(mesh.triangleCoords());

    const COORD_DIMENSION_MESH = 4;
    const nVertsMesh = vertCoordsMesh.length / COORD_DIMENSION_MESH;

    const vertBufferMesh = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBufferMesh);
    gl.bufferData(gl.ARRAY_BUFFER, vertCoordsMesh, gl.STATIC_DRAW);

    const posAttrMesh = gl.getAttribLocation(glProgramMesh, "a_pos");
    gl.vertexAttribPointer(posAttrMesh, COORD_DIMENSION_MESH, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posAttrMesh);


    const colsMesh = new Float32Array(mesh.triangleColors());

    const COL_DIMENSION_MESH = 4;

    const colBufferMesh = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colBufferMesh);
    gl.bufferData(gl.ARRAY_BUFFER, colsMesh, gl.STATIC_DRAW);

    const colAttrMesh = gl.getAttribLocation(glProgramMesh, "a_col");
    gl.vertexAttribPointer(colAttrMesh, COL_DIMENSION_MESH, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colAttrMesh);


    const vertArrayLine = gl.createVertexArray();
    gl.bindVertexArray(vertArrayLine);


    const vertCoordsLine = new Float32Array([
        -1, 0, 0, 0,
        1, 0, 0, 0,

        0, -1, 0, 0,
        0, 1, 0, 0,

        0, 0, -1, 0,
        0, 0, 1, 0,

        0, 0, 0, -1,
        0, 0, 0, 1,
    ]);

    const COORD_DIMENSION_LINE = 4;
    const nVertsLine = vertCoordsLine.length / COORD_DIMENSION_LINE;

    const vertBufferLine = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBufferLine);
    gl.bufferData(gl.ARRAY_BUFFER, vertCoordsLine, gl.STATIC_DRAW);

    const posAttrLine = gl.getAttribLocation(glProgramLine, "a_pos");
    gl.vertexAttribPointer(posAttrLine, COORD_DIMENSION_LINE, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posAttrLine);


    const colsLine = new Float32Array([
        0.77, 0.28, 0.28, 1,
        0.77, 0.28, 0.28, 1,
        
        0.21, 0.65, 0.24, 1,
        0.21, 0.65, 0.24, 1,
        
        0.24, 0.55, 0.72, 1,
        0.24, 0.55, 0.72, 1,
        
        0.69, 0.16, 0.60, 1,
        0.69, 0.16, 0.60, 1,
    ]);

    const COL_DIMENSION_LINE = 4;

    const colBufferLine = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colBufferLine);
    gl.bufferData(gl.ARRAY_BUFFER, colsLine, gl.STATIC_DRAW);

    const colAttrLine = gl.getAttribLocation(glProgramLine, "a_col");
    gl.vertexAttribPointer(colAttrLine, COL_DIMENSION_LINE, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colAttrLine);


    const vertArrayWireframe = gl.createVertexArray();
    gl.bindVertexArray(vertArrayWireframe);

    const vertCoordsWireframe = new Float32Array(mesh.linesCoords());

    const COORD_DIMENSION_WIREFRAME = 4;
    const nVertsWireframe = vertCoordsWireframe.length / COORD_DIMENSION_WIREFRAME;

    const vertBufferWireframe = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBufferWireframe);
    gl.bufferData(gl.ARRAY_BUFFER, vertCoordsWireframe, gl.STATIC_DRAW);

    gl.vertexAttribPointer(posAttrLine, COORD_DIMENSION_WIREFRAME, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posAttrLine);

    //#endregion


    //#region Setting uniforms

    // These uniforms are set later
    const dimensionsMeshUnif = gl.getUniformLocation(glProgramMesh, "u_dimensions");
    const dimensionsLineUnif = gl.getUniformLocation(glProgramLine, "u_dimensions");
    const timeUnif = gl.getUniformLocation(glProgramMesh, "u_time");

    const modelViewMatrix4MainMeshUnif = gl.getUniformLocation(glProgramMesh, "u_modelViewMatrix4.main");
    const modelViewMatrix4RestMeshUnif = gl.getUniformLocation(glProgramMesh, "u_modelViewMatrix4.rest");
    const modelViewMatrix3MeshUnif = gl.getUniformLocation(glProgramMesh, "u_modelViewMatrix3");

    const modelViewMatrix4MainLineUnif = gl.getUniformLocation(glProgramLine, "u_modelViewMatrix4.main");
    const modelViewMatrix4RestLineUnif = gl.getUniformLocation(glProgramLine, "u_modelViewMatrix4.rest");
    const modelViewMatrix3LineUnif = gl.getUniformLocation(glProgramLine, "u_modelViewMatrix3");

    //#endregion


    const camera4Transform = new Transform4(
        new Vector4(-0.5, -0.5, 0, -1.5),
        // Rotor4.planeAngle(new Vector4(0, 0, 1, 0).outer(new Vector4(1, 0, 0, 0)), Math.PI * 1/4),
    );

    const camera3Transform = new Transform4(
        new Vector4(0.25, 0.5, -1, 0),
        // Rotor4.planeAngle(new Vector4(0, 0, 1, 0).outer(new Vector4(1, 0, 0, 0)), Math.PI * 1/8),
    );

    
    const modelTransform = new Transform4(
        new Vector4(0, 0, 0, 0),
        new Rotor4(1, 0, 0, 0, 0, 0, 0, 0),
        new Vector4(0.5, 0.5, 0.5, 0.5),
    );

    // modelTransform.rotate = Rotor4.planeAngle(new Vector4(1, 0, 0, 0).outer(new Vector4(0, 1, 0, 0)), Math.PI * 1/4);


    resizeCanvasAndViewport = () => {
        // Scale up here (by `devicePixelRatio`) and scale down in CSS to appear sharp on high-DPI displays
        // Canvas is downsized to 100vw and 100vh in CSS
        canvas.width = document.documentElement.clientWidth * devicePixelRatio;
        canvas.height = document.documentElement.clientHeight * devicePixelRatio;

        gl.useProgram(glProgramMesh);
        gl.uniform2fv(dimensionsMeshUnif, [canvas.width, canvas.height]);
        gl.useProgram(glProgramLine);
        gl.uniform2fv(dimensionsLineUnif, [canvas.width, canvas.height]);
        
        gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const render = (now: number) => {
        modelTransform.rotate = Rotor4.planeAngle(new Vector4(1, 0, 0, 0).outer(new Vector4(0, 0, 1, 0)), Math.PI * now / 3000)
        // modelTransform.rotate = Rotor4.planeAngle(new Vector4(1, 0, 0, 0).outer(new Vector4(0, 1, 0, 0)), Math.PI * now / 3000)
        //         .mult(Rotor4.planeAngle(new Vector4(0, 0, 1, 0).outer(new Vector4(0, 0, 0, 1)), Math.PI * now / 3000));
        
        // modelTransform.translate = new Vector4(1.5 * Math.cos(now / 1000), 0, 1.5 * Math.sin(now / 1000), 0);
        // camera4Transform.translate = new Vector4(1.5 * Math.cos(now / 1000), 0, 0, -2);

        // Camera inverse transform occurs before model transform, but matrix multiplications are from right-to-left
        const modelViewMatrix4 = modelTransform.matrix().dotMat(camera4Transform.matrixInverse());

        const mainMat = [
            ...modelViewMatrix4.slice(0, 4),
            ...modelViewMatrix4.slice(5, 9),
            ...modelViewMatrix4.slice(10, 14),
            ...modelViewMatrix4.slice(15, 19),
        ];
        const restMat = [
            modelViewMatrix4[4],
            modelViewMatrix4[9],
            modelViewMatrix4[14],
            ...modelViewMatrix4.slice(19, 25),
        ];

        const viewMatrix3_4 = camera3Transform.matrixInverse();
        const viewMatrix3 = [
            ...viewMatrix3_4.slice(0, 3), viewMatrix3_4[4],
            ...viewMatrix3_4.slice(5, 8), viewMatrix3_4[9],
            ...viewMatrix3_4.slice(10, 13), viewMatrix3_4[14],
            ...viewMatrix3_4.slice(20, 23), viewMatrix3_4[24],
        ];


        gl.useProgram(glProgramMesh);

        gl.uniformMatrix4fv(modelViewMatrix4MainMeshUnif, false, mainMat);
        gl.uniformMatrix3fv(modelViewMatrix4RestMeshUnif, false, restMat);

        gl.uniformMatrix4fv(modelViewMatrix3MeshUnif, false, viewMatrix3);
        
        gl.bindVertexArray(vertArrayMesh);
        gl.drawArrays(gl.TRIANGLES, 0, nVertsMesh);


        gl.useProgram(glProgramLine);

        gl.uniformMatrix4fv(modelViewMatrix4MainLineUnif, false, mainMat);
        gl.uniformMatrix3fv(modelViewMatrix4RestLineUnif, false, restMat);

        gl.uniformMatrix4fv(modelViewMatrix3LineUnif, false, viewMatrix3);

        gl.bindVertexArray(vertArrayLine);
        gl.drawArrays(gl.LINES, 0, nVertsLine);
        
        gl.bindVertexArray(vertArrayWireframe);
        gl.drawArrays(gl.LINES, 0, nVertsWireframe);
    };

    resizeCanvasAndViewport();


    const draw = (now: number) => {
        // gl.uniform1f(timeUnif, now / 1000);

        render(now);
        requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
});

</script>

<canvas bind:this={canvas}></canvas>

<svelte:window on:resize={resizeCanvasAndViewport} />

<style lang="scss">
canvas {
    width: 100vw;
    height: 100vh;
}
</style>