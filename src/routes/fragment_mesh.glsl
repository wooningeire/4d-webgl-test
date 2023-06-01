#version 300 es

precision mediump float;

#define PI 3.1415926535

uniform float u_time;
uniform vec2 u_dimensions;

in vec2 v_texcoord;

out vec4 fragColor;
in vec4 v_col;

void main(void)
{
    fragColor = vec4(0.42f, 0.16f, 0.63f, 1.0f);
}