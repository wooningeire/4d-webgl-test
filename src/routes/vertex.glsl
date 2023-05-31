#version 300 es
in vec4 a_pos;

out vec2 v_texcoord;

void main() {
    gl_Position = vec4(a_pos.xy, 0., 1.);
    v_texcoord = (a_pos.xy + 1.0) / 2.0;
}