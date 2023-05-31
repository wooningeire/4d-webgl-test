<script lang="ts">
import {onMount} from "svelte";

import {Gl} from "./Gl";

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

    const COORD_DIMENSION = 4;
    const nVertsMesh = vertCoordsMesh.length / COORD_DIMENSION;

    const vertBufferMesh = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBufferMesh);
    gl.bufferData(gl.ARRAY_BUFFER, vertCoordsMesh, gl.STATIC_DRAW);

    const vertArrayMesh = gl.createVertexArray();
    gl.bindVertexArray(vertArrayMesh);

    const posAttrMesh = gl.getAttribLocation(glProgramMesh, "a_pos");
    gl.vertexAttribPointer(posAttrMesh, COORD_DIMENSION, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posAttrMesh);

    

    const vertCoordsLine = new Float32Array([
        -1, 0, 0, 0,
        1, 0, 0, 0,
    ]);

    const COORD_DIMENSION_LINE = 4;
    const nVertsLine = vertCoordsLine.length / COORD_DIMENSION_LINE;

    const vertBufferLine = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBufferLine);
    gl.bufferData(gl.ARRAY_BUFFER, vertCoordsLine, gl.STATIC_DRAW);

    const vertArrayLine = gl.createVertexArray();
    gl.bindVertexArray(vertArrayLine);

    const posAttrLine = gl.getAttribLocation(glProgramLine, "a_pos");
    gl.vertexAttribPointer(posAttrLine, COORD_DIMENSION_LINE, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posAttrLine);

    //#endregion


    //#region Setting uniforms
    gl.useProgram(glProgramMesh);

    const dimensionsUnif = gl.getUniformLocation(glProgramMesh, "u_dimensions");
    gl.uniform2fv(dimensionsUnif, [0, 0]);

    const timeUnif = gl.getUniformLocation(glProgramMesh, "u_time");
    gl.uniform1f(timeUnif, 0);

    //#endregion


    const resizeCanvasAndViewport = () => {
        // Scale up here (by `devicePixelRatio`) and scale down in CSS to appear sharp on high-DPI displays
        // Canvas is downsized to 100vw and 100vh in CSS
        canvas.width = document.documentElement.clientWidth * devicePixelRatio;
        canvas.height = document.documentElement.clientHeight * devicePixelRatio;

        gl.uniform2fv(dimensionsUnif, [canvas.width, canvas.height]);
        gl.viewport(0, 0, canvas.width, canvas.height);

        render();
    };
    const render = () => {
        gl.useProgram(glProgramMesh);
        gl.bindVertexArray(vertArrayMesh);
        gl.drawArrays(gl.TRIANGLES, 0, nVertsMesh);

        gl.useProgram(glProgramLine);
        gl.bindVertexArray(vertArrayLine);
        gl.drawArrays(gl.LINES, 0, nVertsLine);
    };

    addEventListener("resize", resizeCanvasAndViewport);
    resizeCanvasAndViewport();



    // const draw = (now: number) => {
    //     gl.uniform1f(timeUnif, now / 1000);

    //     gl.drawArrays(gl.TRIANGLES, 0, nVerts);
    //     requestAnimationFrame(draw);
    // };
    // requestAnimationFrame(draw);
});

</script>

<canvas bind:this={canvas}></canvas>

<style lang="scss">
canvas {
    width: 100vw;
    height: 100vh;
}
</style>