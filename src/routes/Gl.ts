export class Gl {
    constructor(private readonly gl: WebGL2RenderingContext) {}

    vertexShader(vertexShaderSource: string) {
        const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER)!;
        this.gl.shaderSource(vertexShader, vertexShaderSource);
        this.gl.compileShader(vertexShader);

        return vertexShader;
    }

    fragmentShader(fragmentShaderSource: string) {
        const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)!;
        this.gl.shaderSource(fragmentShader, fragmentShaderSource);
        this.gl.compileShader(fragmentShader);

        return fragmentShader;
    }

    program(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        const glProgram = this.gl.createProgram()!;
        this.gl.attachShader(glProgram, vertexShader);
        this.gl.attachShader(glProgram, fragmentShader);
        this.gl.linkProgram(glProgram);

        return glProgram;
    }
}

/* 
export class GlLine {
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