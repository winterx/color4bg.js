const shader = 
`// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif



uniform vec2 u_resolution;
uniform float u_time;
uniform float u_expand;
uniform float u_scale;

uniform vec3 u_color_0;
uniform vec3 u_color_1;
uniform vec3 u_color_2;
uniform vec3 u_color_3;
uniform vec3 u_color_4;
uniform vec3 u_color_5;

varying vec2 vUv;


vec3 lut( float x ) {

    if(x<0.0 || x>1.0)
        return u_color_0;

    vec3 color = vec3(1.0);
    
    float P1 = abs(x - 0.0);
    float P2 = abs(x - 0.167);
    float P3 = abs(x - 0.334);
    float P4 = abs(x - 0.500);
    float P5 = abs(x - 0.667);
    float P6 = abs(x - 0.833);
    float P7 = abs(x - 1.0);
    
    float R1 = smoothstep( 1., -0.0, P1 * u_expand) / 1.;
    float R2 = smoothstep( 1., -0.0, P2 * u_expand) / 1.;
    float R3 = smoothstep( 1., -0.0, P3 * u_expand) / 1.;
    float R4 = smoothstep( 1., -0.0, P4 * u_expand) / 1.;
    float R5 = smoothstep( 1., -0.0, P5 * u_expand) / 1.;
    float R6 = smoothstep( 1., -0.0, P6 * u_expand) / 1.;
    float R7 = smoothstep( 1., -0.0, P7 * u_expand) / 1.;
    
    color = u_color_0 * R1 + 
            u_color_1 * R2 +
            u_color_2 * R3 +
            u_color_3 * R4 +
            u_color_4 * R5 + 
            u_color_5 * R6 +
            u_color_0 * R7;
    
    return color;
}

vec3 lut2(float t) {
    if (t < 0.2) {
        // Interpolate between u_color_0 and u_color_1
        return mix(u_color_0, u_color_1, t / 0.2);
    } else if (t < 0.4) {
        // Interpolate between u_color_1 and u_color_2
        return mix(u_color_1, u_color_2, (t - 0.2) / 0.2);
    } else if (t < 0.6) {
        // Interpolate between u_color_2 and u_color_3
        return mix(u_color_2, u_color_3, (t - 0.4) / 0.2);
    } else if (t < 0.8) {
        // Interpolate between u_color_3 and u_color_4
        return mix(u_color_3, u_color_4, (t - 0.6) / 0.2);
    } else {
        // Interpolate between u_color_4 and u_color_5
        return mix(u_color_4, u_color_5, (t - 0.8) / 0.2);
    }
}

void main() {
    float mr = min(u_resolution.x, u_resolution.y);
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / mr;

	vec2 sst = uv * u_scale;

    float d = -u_time * 0.5;
    float a = 0.0;
    for (float i = 0.0; i < 8.0; ++i) {
        a -= cos(i + d - a * sst.x);
        d += sin(sst.y * i + a);
    }
    d += u_time * 0.5;
    vec3 col = vec3(cos(sst * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
    col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5);
    
    float f = clamp(0.0, 1.0, col.r * col.r * col.b);
    
    vec3 finalCol = lut2(f);
    gl_FragColor = vec4(finalCol, 1);
}
`

export default shader