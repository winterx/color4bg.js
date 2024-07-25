import { Plane, Program, Mesh, RenderTarget, Camera, Vec2, Color } from "../../ogl/src/index.js"
import { ColorBg } from "../ColorBg.js"

const types = {
	"ambient-light": {
		st_scale: 1.0,
		curl_scale: 5.0,
		brightness: 0.2,
		darkness: 0.0
	},
	"abstract-floating-colors": {
		st_scale: 5.0,
		curl_scale: 0.5,
		brightness: 1.2,
		darkness: 0.0
	},
    "test": {
		st_scale: 1.2,
		curl_scale: 0.5,
		brightness: 1.2,
		darkness: 0.0
	},
}

const type = "ambient-light"

export class AmbientLightBg extends ColorBg {
	constructor(params = {}) {
		super(params, 6)
		this.name = "ambient-light"

		this.typedata = types[type]
		this.speed = 500

		this.start()
	}

	_initRtt() {
		// RTT--RENDER TO TEXTURE
		this.rtt = new RenderTarget(this.gl, {
			width: 512,
			height: 512
		})
		this.rttCamera = new Camera(this.gl, { left: -0.5, right: 0.5, bottom: -0.5, top: 0.5, zoom: 1 })
		this.rttCamera.position.z = 1

		this.rttPlaneGeo = new Plane(this.gl, {})

		this.rttProgram = new Program(this.gl, {
			vertex: /* glsl */ `
                attribute vec3 position;
                attribute vec2 uv;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
			fragment: /* glsl */ `
                #ifdef GL_ES
                precision mediump float;
                #endif
        
                uniform float u_time;
                uniform vec2 u_resolution;
                uniform float u_expand;

                uniform vec3 u_color_0;
                uniform vec3 u_color_1;
                uniform vec3 u_color_2;
                uniform vec3 u_color_3;
                uniform vec3 u_color_4;
                uniform vec3 u_color_5;

                varying vec2 vUv;

                const float x1 = 0.0;
                const float x2 = 0.167;
                const float x3 = 0.334;
                const float x4 = 0.500;
                const float x5 = 0.667;
                const float x6 = 0.833;
                const float x7 = 1.0;

                float taylorInvSqrt(in float r) { return 1.79284291400159 - 0.85373472095314 * r; }
                vec2 taylorInvSqrt(in vec2 r) { return 1.79284291400159 - 0.85373472095314 * r; }
                vec3 taylorInvSqrt(in vec3 r) { return 1.79284291400159 - 0.85373472095314 * r; }
                vec4 taylorInvSqrt(in vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
                

                float mod289(const in float x) { return x - floor(x * (1. / 289.)) * 289.; }
                vec2 mod289(const in vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
                vec3 mod289(const in vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
                vec4 mod289(const in vec4 x) { return x - floor(x * (1. / 289.)) * 289.; }

                float permute(const in float v) { return mod289(((v * 34.0) + 1.0) * v); }
                vec2 permute(const in vec2 v) { return mod289(((v * 34.0) + 1.0) * v); }
                vec3 permute(const in vec3 v) { return mod289(((v * 34.0) + 1.0) * v); }
                vec4 permute(const in vec4 v) { return mod289(((v * 34.0) + 1.0) * v); }

                vec4 grad4(float j, vec4 ip) {
                    const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
                    vec4 p,s;
                    p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
                    p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
                    s = vec4(lessThan(p, vec4(0.0)));
                    p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;
                    return p;
                }

                
                float snoise(in vec3 v) {
                    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
                    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

                    // First corner
                    vec3 i  = floor(v + dot(v, C.yyy) );
                    vec3 x0 =   v - i + dot(i, C.xxx) ;

                    // Other corners
                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min( g.xyz, l.zxy );
                    vec3 i2 = max( g.xyz, l.zxy );

                    //   x0 = x0 - 0.0 + 0.0 * C.xxx;
                    //   x1 = x0 - i1  + 1.0 * C.xxx;
                    //   x2 = x0 - i2  + 2.0 * C.xxx;
                    //   x3 = x0 - 1.0 + 3.0 * C.xxx;
                    vec3 x1 = x0 - i1 + C.xxx;
                    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
                    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

                    // Permutations
                    i = mod289(i);
                    vec4 p = permute( permute( permute(
                                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

                    // Gradients: 7x7 points over a square, mapped onto an octahedron.
                    // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
                    float n_ = 0.142857142857; // 1.0/7.0
                    vec3  ns = n_ * D.wyz - D.xzx;

                    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

                    vec4 x_ = floor(j * ns.z);
                    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

                    vec4 x = x_ *ns.x + ns.yyyy;
                    vec4 y = y_ *ns.x + ns.yyyy;
                    vec4 h = 1.0 - abs(x) - abs(y);

                    vec4 b0 = vec4( x.xy, y.xy );
                    vec4 b1 = vec4( x.zw, y.zw );

                    //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
                    //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
                    vec4 s0 = floor(b0)*2.0 + 1.0;
                    vec4 s1 = floor(b1)*2.0 + 1.0;
                    vec4 sh = -step(h, vec4(0.0));

                    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
                    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

                    vec3 p0 = vec3(a0.xy,h.x);
                    vec3 p1 = vec3(a0.zw,h.y);
                    vec3 p2 = vec3(a1.xy,h.z);
                    vec3 p3 = vec3(a1.zw,h.w);

                    //Normalise gradients
                    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                    p0 *= norm.x;
                    p1 *= norm.y;
                    p2 *= norm.z;
                    p3 *= norm.w;

                    // Mix final noise value
                    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                    m = m * m;
                    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                                dot(p2,x2), dot(p3,x3) ) );
                }

                vec3 snoise3( vec3 x ){
                    float s  = snoise(vec3( x ));
                    float s1 = snoise(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));
                    float s2 = snoise(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));
                    return vec3( s , s1 , s2 );
                }

                vec3 curl( vec3 p ){
                    const float e = .1;
                    vec3 dx = vec3( e   , 0.0 , 0.0 );
                    vec3 dy = vec3( 0.0 , e   , 0.0 );
                    vec3 dz = vec3( 0.0 , 0.0 , e   );

                    vec3 p_x0 = snoise3( p - dx );
                    vec3 p_x1 = snoise3( p + dx );
                    vec3 p_y0 = snoise3( p - dy );
                    vec3 p_y1 = snoise3( p + dy );
                    vec3 p_z0 = snoise3( p - dz );
                    vec3 p_z1 = snoise3( p + dz );

                    float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
                    float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
                    float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

                    const float divisor = 1.0 / ( 2.0 * e );
                    #ifndef CURL_UNNORMALIZED
                    return normalize( vec3( x , y , z ) * divisor );
                    #else
                    return vec3( x , y , z ) * divisor;
                    #endif
                }
                    
                vec3 blendColor ( vec3 color_0, vec3 color_1, float alpha ) {
            
                    vec3 color = color_0 * ( 1.05 - alpha ) + color_1 * alpha;
            
                    return color;
            
                }

                uniform float u_st_scale;
                uniform float u_curl_scale;
                uniform float u_brightness;
                uniform float u_darkness;
        
                void main()
                {
                    vec2 pixel = 1.0/u_resolution.xy;
                    vec2 st = gl_FragCoord.xy * pixel;

                    vec3 d3 = curl( vec3( st * u_st_scale, u_time ) ) * u_curl_scale + 0.5;

                    vec4 color_0 = vec4( u_color_0, d3.r * u_brightness );
                    vec4 color_1 = vec4( u_color_1, d3.g * u_brightness );
                    vec4 color_2 = vec4( u_color_2, d3.b * u_brightness );
                    vec4 color_3 = vec4( u_color_3, d3.r * u_brightness );
                    vec4 color_4 = vec4( u_color_4, d3.g * u_brightness );
                    vec4 color_5 = vec4( u_color_5, d3.b * u_brightness );

                    vec3 color = vec3( u_darkness );
                    
                    color = blendColor( color, color_0.rgb, color_0.a );
                    color = blendColor( color, color_1.rgb, color_1.a );
                    color = blendColor( color, color_2.rgb, color_2.a );
                    color = blendColor( color, color_3.rgb, color_3.a );
                    color = blendColor( color, color_4.rgb, color_4.a );
                    color = blendColor( color, color_5.rgb, color_5.a );

                    // vec3 finalColor = color_0 + color_1 + color_2 + color_3 + color_4 + color_5;
                    
                    // color = vec3(d3.r);
                    gl_FragColor = vec4( color, 1.0);
                }
            `,

			uniforms: {
				u_time: { value: 0 },
				u_resolution: { value: new Vec2(this.canvasW * 2, this.canvasH * 2) },
				u_expand: { value: 6.0 },
				u_color_0: { value: new Color(this.palette[0]) },
				u_color_1: { value: new Color(this.palette[1]) },
				u_color_2: { value: new Color(this.palette[2]) },
				u_color_3: { value: new Color(this.palette[3]) },
				u_color_4: { value: new Color(this.palette[4]) },
				u_color_5: { value: new Color(this.palette[5]) },
				u_st_scale: { value: this.typedata["st_scale"] },
				u_curl_scale: { value: this.typedata["curl_scale"] },
				u_brightness: { value: this.typedata["brightness"] },
				u_darkness: { value: this.typedata["darkness"] }
			}
		})

		this.rttPlane = new Mesh(this.gl, { geometry: this.rttPlaneGeo, program: this.rttProgram })
		this.isRenderTarget = true
	}

	_resetSeed() {
		// this.rttProgram.uniforms.u_rand_1.value = this.rng() * 200 - 100
		// this.rttProgram.uniforms.u_rand_2.value = this.rng() * 200 - 100
	}

	_makeMaterial() {
		this._planeShader = new Program(this.gl, {
			vertex: /* glsl */ `
                attribute vec3 position;
                attribute vec2 uv;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
			fragment: /* glsl */ `
                precision highp float;
                uniform sampler2D tMap;
                uniform float uNoiseFactor;
                uniform float uTime;

                float random(vec2 co) {
                    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
                }

                varying vec2 vUv;
                
                void main() {
                    vec4 color = texture2D(tMap, vUv);

                    float noise = (random(vUv) - 0.5) * uNoiseFactor;
                    color.rgb = color.rgb + color.rgb * noise;

                    gl_FragColor = color;
                }
            `,
			uniforms: {
				tMap: { value: this.rtt.texture },
				uNoiseFactor: { value: 0.1 },
				uTime: { value: 0 }
			}
		})
	}

	_make() {
		const planeGeo = new Plane(this.gl, {
			width: this.canvasW,
			height: this.canvasH
		})

		const plane = new Mesh(this.gl, {
			geometry: planeGeo,
			program: this._planeShader
		})

		plane.setParent(this.scene)
	}

	_resetColors() {
		this.rttProgram.uniforms.u_color_0.value = new Color(this.palette[0])
		this.rttProgram.uniforms.u_color_1.value = new Color(this.palette[1])
		this.rttProgram.uniforms.u_color_2.value = new Color(this.palette[2])
		this.rttProgram.uniforms.u_color_3.value = new Color(this.palette[3])
		this.rttProgram.uniforms.u_color_4.value = new Color(this.palette[4])
		this.rttProgram.uniforms.u_color_5.value = new Color(this.palette[5])
	}

	_animate() {
		this.rttProgram.uniforms.u_time.value = this.frame / this.speed
	}

	update(option, val) {
		switch (option) {
			case "noise":
				this._planeShader.uniforms.uNoiseFactor.value = parseFloat(val)
				break

			case "speed":
				let v = parseInt(val)
				this.speed = (v * -400) / 9 + 4900 / 9
				break

			case "pattern scale":
                let s = parseFloat(val)
				this.rttProgram.uniforms.u_st_scale.value = -19 * s + 20
				break

			case "edge blur":
                let e = parseFloat(val)
				this.rttProgram.uniforms.u_curl_scale.value = -4 * e + 5
				break

			case "brightness":
                let b = parseFloat(val)
				this.rttProgram.uniforms.u_brightness.value = b
				break

			case "darkness":
                let d = parseFloat(val)
				this.rttProgram.uniforms.u_darkness.value = d
				break
		}
	}
}
