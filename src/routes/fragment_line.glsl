#version 300 es

precision mediump float;

#define PI 3.1415926535

uniform float u_time;
uniform vec2 u_dimensions;

in vec2 v_texcoord;
in vec4 v_col;

out vec4 fragColor;

void main(void)
{
    fragColor = v_col;
}