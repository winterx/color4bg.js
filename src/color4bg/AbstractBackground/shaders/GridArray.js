const shader = 
`
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

uniform float u_scale;
uniform float u_seed;
uniform float u_w;
uniform float u_h;
uniform float u_x;
uniform float u_y;
uniform float u_amplitude;
uniform float u_radius;
uniform float u_borderwidth;
uniform float u_rotateCanvas;
uniform float u_rotateUnit;

uniform vec3 u_color_0;
uniform vec3 u_color_1;
uniform vec3 u_color_2;
uniform vec3 u_color_3;
uniform vec3 u_color_4;
uniform vec3 u_color_5;

varying vec2 vUv;

vec2 rotate(vec2 uv, float angle) {
    float x = uv.x - 0.5;
    float y = uv.y - 0.5;
    float c = cos(radians(angle));
    float s = sin(radians(angle));
    return vec2(
        x * c - y * s + 0.5,
        x * s + y * c + 0.5
    );
}

float box( vec2 st, vec2 pos, vec2 size ) {
    vec2 percent = (st - pos) / size;
	if (all(greaterThanEqual(percent, vec2(0.0))) && all(lessThanEqual(percent, vec2(1.0)))) {
        return 1.0;
    } else {
        return 0.0;
    }
}

float box( vec2 st, vec2 pos, vec2 size, float radius ) {
    vec2 percent = (st - pos) / size;
    
    vec2 distance = abs(percent - 0.5) - 0.5 + vec2(radius) / size;
    float edge = length(max(distance, 0.0));
    if (edge <= radius / size.x) {
        return 1.0;
    } else {
        return 0.0;
    }
}

vec3 box( vec2 st, vec2 pos, vec2 size, float radius, float borderwidth, vec4 color, float threshold ) {
	vec2 percent = (st - pos) / size;
    vec2 distance = abs(percent - 0.5) - 0.5 + radius / size;
    float edge = length(max(distance, 0.0));
    
    vec3 result = vec3(0.0);
    if (edge <= (radius + borderwidth) / size.x && edge >= (radius - borderwidth) / size.x) {
        return result = color.rgb * color.a + u_color_0 * ( 1.0 - color.a );
    } 
    else {
        return result = vec3(u_color_0);
    }
}

vec3 pickColor(float value) {
    if( value > 0.8 ) {
        return u_color_5;
    }else if( value > 0.6 ) {
        return u_color_4;
    }else if( value > 0.4 ) {
        return u_color_3;
    }else if( value > 0.2 ) {
        return u_color_2;
    }else{
        return u_color_1;
    }
}

void main() {

    vec2 st = gl_FragCoord.xy / u_resolution;
    st = rotate( st, u_rotateCanvas );

	vec2 sst = st * u_scale;
    
    float mx = mod( sst.x, 10. ) / 10.;
    float my = mod( sst.y, 10. ) / 10.;

    float rand_base = sin( dot( floor( sst / 10. ), vec2( 113.1, 17.81 ))) * u_seed;
    float rand_2 = 0.5 + 0.5 * cos( rand_base ); // for color pick
    rand_2 = mod( floor(rand_2 * 100.0), 10.0 ) / 10.0;

    float rand_3 = 0.5 + 0.5 * sin( rand_base + rand_base ); // for filter
    float threshold = clamp( floor( rand_3 * 10.0 - 8.7 ), 0.0, 1.0 ); // filter

    float alpha = 0.5 + u_amplitude * cos( u_time + rand_base + 100. );


    vec3 colorpicked = pickColor(rand_2);
    vec3 finalColor = box( rotate(vec2(mx, my), u_rotateUnit ), vec2(u_x, u_y), vec2(u_w, u_h), u_radius, u_borderwidth, vec4( colorpicked, alpha ), 1. );

    gl_FragColor = vec4( finalColor, 1.0 );
    // gl_FragColor = vec4( vec3(rand_2), 1.0 );
    // gl_FragColor = vec4( vec3(threshold * alpha), 1.0 );
}
`

export default shader