const shader = 
`
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_pos;
uniform vec2 u_size;
uniform float u_radius;
uniform float u_spacing;
uniform float u_borderwidth;
uniform int u_x_num;
uniform int u_y_num;

uniform vec3 u_color_0;
uniform vec3 u_color_1;
uniform vec3 u_color_2;
uniform vec3 u_color_3;
uniform vec3 u_color_4;
uniform vec3 u_color_5;

varying vec2 vUv;

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

float box( vec2 st, vec2 pos, vec2 size, float radius, float borderwidth, float alpha ) {
	vec2 percent = (st - pos) / size;
    vec2 distance = abs(percent - 0.5) - 0.5 + radius / size;
    float edge = length(max(distance, 0.0));
    
    float result;
    if (edge <= (radius + borderwidth) / size.x && edge >= (radius - borderwidth) / size.x) {
        return result = 1.0 * alpha;
    } else {
        return result = 0.0;
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

    float d;

    vec4 bgColor = vec4( 0.0, 0.0, 0.0, 0.0 );
    vec4 finalColor = vec4( 0.0, 0.0, 0.0, 0.0 );

	vec2 sst = st * 100.;
    
    float mx = mod( sst.x, 10. ) / 10.;
    float my = mod( sst.y, 10. ) / 10.;

    // fake random
    float alpha;
    alpha  = cos(u_time * 1.000 + distance(vUv, vec2(0.0, 0.0)) * 8.0) * 0.5 + 0.5;
    alpha += cos(u_time * 0.666 + distance(vUv, vec2(1.0, 0.0)) * 8.0) * 0.5 + 0.5;
    alpha += cos(u_time * 0.777 + distance(vUv, vec2(0.5, 1.3)) * 8.0) * 0.5 + 0.5;
    alpha = floor(alpha * 5.0)/10.0;
    
    d = box( vec2(mx, my), u_pos, u_size, u_radius, u_borderwidth, alpha );



    gl_FragColor = vec4( vec3(alpha), 1.0 );
}
`

export default shader