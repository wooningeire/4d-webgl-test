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