<script lang="ts">
import {onMount} from "svelte";

import {Gl} from "./Gl";
import {Transform4} from "$/4d/Transform4";
import {Bivector4, Rotor4, Vector4} from "$/4d/vector";

import vertexShaderSource from "./vertex.glsl?raw";
import fragmentShaderMeshSource from "./fragment_mesh.glsl?raw";
import fragmentShaderLineSource from "./fragment_line.glsl?raw";

let canvas: HTMLCanvasElement;

onMount(() => {
    const gl = canvas.getContext("webgl2")!;

    const gle = new Gl(gl);


    //#region Shader setup

    const vertexShader = gle.vertexShader(vertexShaderSource);
    const fragmentShaderMesh = gle.fragmentShader(fragmentShaderMeshSource);
    const glProgramMesh = gle.program(vertexShader, fragmentShaderMesh);

    const fragmentShaderLine = gle.fragmentShader(fragmentShaderLineSource);
    const glProgramLine = gle.program(vertexShader, fragmentShaderLine);

    //#endregion


    //#region Setting attributes

    const vertCoordsMesh = new Float32Array([
        -.5, -.5, -1, -1,
        -1, 1, 1, 1,
        1, -1, 1, 1,

        -1, 1, 1, 1,
        1, -1, 1, 1,
        1, 1, 1, 1,
    ]);

    const COORD_DIMENSION_MESH = 4;
    const nVertsMesh = vertCoordsMesh.length / COORD_DIMENSION_MESH;

    const vertBufferMesh = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBufferMesh);
    gl.bufferData(gl.ARRAY_BUFFER, vertCoordsMesh, gl.STATIC_DRAW);

    const vertArrayMesh = gl.createVertexArray();
    gl.bindVertexArray(vertArrayMesh);

    const posAttrMesh = gl.getAttribLocation(glProgramMesh, "a_pos");
    gl.vertexAttribPointer(posAttrMesh, COORD_DIMENSION_MESH, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posAttrMesh);


    /* 
    class GlLine {
        readonly vertBuffer: WebGLBuffer;
        readonly vertArray: WebGLVertexArrayObject;

        constructor(readonly vertCoords: Float32Array) {
            const COORD_DIMENSION_LINE = 4;
            const nVertsLine = vertCoords.length / COORD_DIMENSION_LINE;

            this.vertBuffer = gl.createBuffer()!;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertCoords, gl.STATIC_DRAW);

            this.vertArray = gl.createVertexArray()!;
            gl.bindVertexArray(this.vertArray);

            const posAttrLine = gl.getAttribLocation(glProgramLine, "a_pos");
            gl.vertexAttribPointer(posAttrLine, COORD_DIMENSION_LINE, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(posAttrLine);
        }
    }

    const xAxis = new GlLine(new Float32Array([
        -1, 0, 0, 0,
        1, 0, 0, 0,
    ]));
    */


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

    //#endregion


    //#region Setting uniforms

    // These uniforms are set later
    const dimensionsUnif = gl.getUniformLocation(glProgramMesh, "u_dimensions");
    const timeUnif = gl.getUniformLocation(glProgramMesh, "u_time");

    const modelViewMatrixMeshMainUnif = gl.getUniformLocation(glProgramMesh, "u_modelViewMatrix.main");
    const modelViewMatrixMeshRestUnif = gl.getUniformLocation(glProgramMesh, "u_modelViewMatrix.rest");

    const modelViewMatrixLineMainUnif = gl.getUniformLocation(glProgramLine, "u_modelViewMatrix.main");
    const modelViewMatrixLineRestUnif = gl.getUniformLocation(glProgramLine, "u_modelViewMatrix.rest");



    const cameraTransform = new Transform4();
    cameraTransform.translate = new Vector4(0.5, 0.5, -1.5, 0);
    
    const modelTransform = new Transform4(
        new Vector4(0, 0, 0, 0),
        Rotor4.planeAngle(new Vector4(1, 0, 0, 0).outer(new Vector4(0, 1, 0, 0)), Math.PI * 1/8),
        new Vector4(0.5, 0.5, 0.5, 1),
    );
    const modelMatrix = modelTransform.matrix();
    console.log(modelMatrix);

    // Camera inverse transform occurs before model transform, but matrix multiplications are from right-to-left
    const computeModelViewMatrix = () => modelTransform.matrix().dotMat(cameraTransform.matrixInverse());

    //#endregion


    const resizeCanvasAndViewport = () => {
        // Scale up here (by `devicePixelRatio`) and scale down in CSS to appear sharp on high-DPI displays
        // Canvas is downsized to 100vw and 100vh in CSS
        canvas.width = document.documentElement.clientWidth * devicePixelRatio;
        canvas.height = document.documentElement.clientHeight * devicePixelRatio;

        gl.uniform2fv(dimensionsUnif, [canvas.width, canvas.height]);
        gl.viewport(0, 0, canvas.width, canvas.height);

        // render();
    };
    const render = (now: number) => {
        modelTransform.rotate = Rotor4.planeAngle(new Vector4(0, 1, 0, 0).outer(new Vector4(0, 0, 1, 0)), Math.PI * now / 2000);
        const modelViewMatrix = computeModelViewMatrix();

        const mainMat = [
            ...modelViewMatrix.slice(0, 4),
            ...modelViewMatrix.slice(5, 9),
            ...modelViewMatrix.slice(10, 14),
            ...modelViewMatrix.slice(15, 19),
        ];
        const restMat = [
            modelViewMatrix[4],
            modelViewMatrix[9],
            modelViewMatrix[14],
            ...modelViewMatrix.slice(19, 25),
        ];


        gl.useProgram(glProgramMesh);
        gl.bindVertexArray(vertArrayMesh);

        gl.uniformMatrix4fv(modelViewMatrixMeshMainUnif, false, mainMat);
        gl.uniformMatrix3fv(modelViewMatrixMeshRestUnif, false, restMat);
        
        gl.drawArrays(gl.TRIANGLES, 0, nVertsMesh);


        gl.useProgram(glProgramLine);
        gl.bindVertexArray(vertArrayLine);

        gl.uniformMatrix4fv(modelViewMatrixLineMainUnif, false, mainMat);
        gl.uniformMatrix3fv(modelViewMatrixLineRestUnif, false, restMat);

        gl.drawArrays(gl.LINES, 0, nVertsLine);
    };

    addEventListener("resize", resizeCanvasAndViewport);
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

<style lang="scss">
canvas {
    width: 100vw;
    height: 100vh;
}
</style>