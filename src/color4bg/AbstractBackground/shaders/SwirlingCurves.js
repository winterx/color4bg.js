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
uniform float u_random;
uniform float u_density;

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



float hash(vec2 p)  // replace this by something better
{
    p  = fract( p*0.6180339887 );
    p *= u_random * 20.;
    return fract( p.x*p.y*(p.x+p.y) );
}

// consider replacing this by a proper noise function
float noise( in vec2 x )
{
    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f*f*(3.0-2.0*f);
    float a = hash(p+vec2(0,0));
	float b = hash(p+vec2(1,0));
	float c = hash(p+vec2(0,1));
	float d = hash(p+vec2(1,1));
    return mix(mix( a, b,f.x), mix( c, d,f.x),f.y);
}

const mat2 mtx = mat2( 0.80,  0.60, -0.60,  0.80 );

float fbm4( vec2 p )
{
    float f = 0.0;
    f += 0.5000*(-1.0+2.0*noise( p )); p = mtx*p*2.02;
    f += 0.2500*(-1.0+2.0*noise( p )); p = mtx*p*2.03;
    f += 0.1250*(-1.0+2.0*noise( p )); p = mtx*p*2.01;
    f += 0.0625*(-1.0+2.0*noise( p ));
    return f/0.9375;
}

float fbm6( vec2 p )
{
    float f = 0.0;
    f += 0.500000*noise( p ); p = mtx*p*2.02;
    f += 0.250000*noise( p ); p = mtx*p*2.03;
    f += 0.125000*noise( p ); p = mtx*p*2.01;
    f += 0.062500*noise( p ); p = mtx*p*2.04;
    f += 0.031250*noise( p ); p = mtx*p*2.01;
    f += 0.015625*noise( p );
    return f/0.96875;
}

vec2 fbm4_2( vec2 p )
{
    return vec2( fbm4(p+vec2(1.0)), fbm4(p+vec2(6.2)) );
}

vec2 fbm6_2( vec2 p )
{
    return vec2( fbm6(p+vec2(9.2)), fbm6(p+vec2(5.7)) );
}

float func( vec2 q, out vec2 o, out vec2 n )
{
    q += 0.0015 * sin( vec2(10.11,0.13) + length( q ) * 11.0);
    
    q *= 0.10;

    o = 0.5 + 0.5*fbm4_2( q );
    
    o += 0.02 * sin(vec2(0.800,0.800) * u_density * length( o ));

    n = fbm6_2( 4.0 * o );

    vec2 p = q + 2.0*n + u_time / 500.;

    float f = 0.5 + 0.5*fbm4( 2.0*p );

    f = mix( f, f*f*f*3.5, f*abs(n.x) );

    f *= 1.0-0.5*pow( 0.5+0.5*sin(8.0*p.x)*sin(8.0*p.y), 8.0 );

    return f;
}

float funcs( in vec2 q )
{
    vec2 t1, t2;
    return func(q,t1,t2);
}

void main()
{
    vec3 col = vec3( 0. );

    vec2 q = u_scale * vUv;


    vec2 o, n;
    float f = func(q, o, n);
    
    // vec3 col = vec3(u_color_1);
    col = mix( col, u_color_1, f * 0.5 );
    col = mix( col, u_color_2, dot(n,n) / 1.4 );
    col = mix( col, u_color_3, 0.75 * o.y * o.y );
    col = mix( col, u_color_5, 0.15 * smoothstep( 1.2, 1.3, abs(n.y) + abs(n.x) ) );
    col *= f * 2.;
    // col = col * col;
    
	vec2 p = vUv;
	col *= 0.5 + 0.5 * sqrt(16.0*p.x*p.y*(1.0-p.x)*(1.0-p.y));
    
    vec3 ff = lut(col.r);
	
	gl_FragColor = vec4( ff, 1.0 );
}
`

export default shader