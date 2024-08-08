const shader = `

precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

uniform vec3 u_color_0;
uniform vec3 u_color_1;
uniform vec3 u_color_2;
uniform vec3 u_color_3;
uniform vec3 u_color_4;
uniform vec3 u_color_5;

uniform float u_expand;
uniform float u_random;


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

varying vec2 vUv;

float colormap_red(float x) {
    if (x < 0.0) {
        return 54.0 / 255.0;
    } else if (x < 20049.0 / 82979.0) {
        return (829.79 * x + 54.51) / 255.0;
    } else {
        return 1.0;
    }
}

float colormap_green(float x) {
    if (x < 20049.0 / 82979.0) {
        return 0.0;
    } else if (x < 327013.0 / 810990.0) {
        return (8546482679670.0 / 10875673217.0 * x - 2064961390770.0 / 10875673217.0) / 255.0;
    } else if (x <= 1.0) {
        return (103806720.0 / 483977.0 * x + 19607415.0 / 483977.0) / 255.0;
    } else {
        return 1.0;
    }
}

float colormap_blue(float x) {
    if (x < 0.0) {
        return 54.0 / 255.0;
    } else if (x < 7249.0 / 82979.0) {
        return (829.79 * x + 54.51) / 255.0;
    } else if (x < 20049.0 / 82979.0) {
        return 127.0 / 255.0;
    } else if (x < 327013.0 / 810990.0) {
        return (792.02249341361393720147485376583 * x - 64.364790735602331034989206222672) / 255.0;
    } else {
        return 1.0;
    }
}

vec4 colormap(float x) {
    return vec4(colormap_red(x), colormap_green(x), colormap_blue(x), 1.0);
}

float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);

    float res = mix(
        mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
        mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
    return res*res;
}

const mat2 mtx = mat2( 0.80,  0.60, -0.60,  0.80 );

float fbm( vec2 p )
{
    float f = 0.0;

    f += 0.500000*noise( p + 0.  ); p = mtx * p * 2.02;
    f += 0.031250*noise( p + u_time ); p = mtx * p * 2.01;
    f += 0.250000*noise( p + u_time); p = mtx * p * (1.03 + u_random);
    f += 0.125000*noise( p ); p = mtx * p * 2.01;
    f += 0.062500*noise( p + u_time); p = mtx * p * 2.04;
    f += 0.015625*noise( p + sin(u_time) );

    return f/0.96875;
}

float pattern( in vec2 p )
{
    return fbm( p + fbm( p + fbm( p + fbm(p) ) ) );
}

void main()
{
    float shade = pattern(vUv);

    vec3 color = lut(shade);

    gl_FragColor = vec4( color, 1.0);
}
`

export default shader