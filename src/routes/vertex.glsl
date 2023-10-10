#version 300 es
in vec4 a_pos;
in vec4 a_col;

struct Vec5 {
    vec4 v;
    float t;
};
struct Mat5 {
    mat4 main; // top-left 4×4 elements [0,1,2,3, 5,6,7,8, 10,11,12,13, 15,16,17,18]
    mat3 rest; // remaining elements: first the 5th of first 4 columns and then the 5th column [4,9,14,19, 20,21,22,23,24]
};
uniform Mat5 u_modelViewMatrix4;

uniform mat4 u_modelViewMatrix3;


uniform mediump vec2 u_dimensions;

out vec2 v_texcoord;
out vec4 v_col;


/**
 * Matrix-vector multiplication
 */
float vec5_dot_vec5(Vec5 a, Vec5 b) {
    return dot(a.v.xyzw, b.v.xyzw) + a.t * b.t;
}
Vec5 mat5_dot_vec5(Mat5 mat, Vec5 vec) {
    return Vec5(
        vec4(
            vec5_dot_vec5(Vec5(mat.main[0].xyzw, mat.rest[0].x), vec),
            vec5_dot_vec5(Vec5(mat.main[1].xyzw, mat.rest[0].y), vec),
            vec5_dot_vec5(Vec5(mat.main[2].xyzw, mat.rest[0].z), vec),
            vec5_dot_vec5(Vec5(mat.main[3].xyzw, mat.rest[1].x), vec)
        ),
        vec5_dot_vec5(Vec5(vec4(mat.rest[1].yz, mat.rest[2].xy), mat.rest[2].z), vec)
    );
}

/**
 * Multiplies `mat` by the 5D homogeneous form of `vec`
 */
vec4 mat5_dot_vec4(Mat5 mat, vec4 vec) {
    // return vec4(
    //     dot(mat.x, vec),
    //     dot(mat.y, vec),
    //     dot(mat.z, vec),
    //     dot(mat.w, vec)
    // ) + mat.t;

    return mat5_dot_vec5(mat, Vec5(vec, 1.)).v;
}

vec3 project4_to_3(Mat5 modelViewMatrix4, vec4 pos) {
    vec4 untransformed = mat5_dot_vec4(modelViewMatrix4, pos);
    return untransformed.xyz / untransformed.w;
}

vec3 project3_to_2(mat4 viewMatrix3, vec3 pos) {
    vec4 untransformed = vec4(pos, 1.) * viewMatrix3;
    return vec3(untransformed.xy / untransformed.z, untransformed.z / 1000. - 1.0002); // temp Z for depth
}

void main() {
    vec3 projection3 = project4_to_3(u_modelViewMatrix4, a_pos);
    vec3 position = project3_to_2(u_modelViewMatrix3, projection3);

    // Adjust coordinates so that viewport is square
    float maxDimension = max(u_dimensions.x, u_dimensions.y);
    position.x = position.x * maxDimension / u_dimensions.x;
    position.y = position.y * maxDimension / u_dimensions.y;

    gl_Position = vec4(position, 1.);
    v_texcoord = (a_pos.xy + 1.) / 2.;

    v_col = a_col;
}