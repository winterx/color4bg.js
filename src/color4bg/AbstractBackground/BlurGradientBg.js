import { Plane, Program, Mesh, RenderTarget, Camera, Vec2, Color } from "../../ogl/src/index.js"
import { ColorBg } from "../ColorBg.js"

export class BlurGradientBg extends ColorBg {
	constructor(params = {}) {
		super(params, 4)

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
        
                uniform vec3 u_color_0;
                uniform vec3 u_color_1;
                uniform vec3 u_color_2;
                uniform vec3 u_color_3;
        
                uniform float u_scale;
                uniform float u_rand_1;
                uniform float u_rand_2;
        
                #define S(a,b,t) smoothstep(a,b,t)
        
                varying vec2 vUv;
        
                mat2 Rot(float a)
                {
                    float s = sin(a);
                    float c = cos(a);
                    return mat2(c, -s, s, c);
                }
        
                vec2 hash( vec2 p )
                {
                    p = vec2( dot(p,vec2(2127.1,81.17)), dot(p,vec2(1269.5,283.37)) );
                    return fract(sin(p)*43758.5453);
                }
        
                float noise( in vec2 p )
                {
                    vec2 i = floor( p );
                    vec2 f = fract( p );
                    
                    vec2 u = f*f*(3.0-2.0*f);
            
                    float n = mix( mix( dot( -1.0+2.0*hash( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                                        dot( -1.0+2.0*hash( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                                    mix( dot( -1.0+2.0*hash( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                                        dot( -1.0+2.0*hash( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
                    return 0.5 + 0.5*n;
                }
        
        
                void main()
                {
                    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
                    float ratio = u_resolution.x / u_resolution.y;
        
                    vec2 tuv = vUv;
                    tuv *= u_scale;
                    tuv -= .5;
        
                    // rotate with Noise
                    float degree = noise(vec2(u_time*.1, tuv.x*tuv.y));
        
                    tuv *= Rot( radians( ( degree - 0.5 ) * 720. + 180. ));
        
                    // Wave warp with sin
                    float frequency = 5.;
                    float amplitude = 130.;
                    float speed = 2.;
                    tuv.x += sin( tuv.y * frequency + speed ) / amplitude;
                    tuv.y += sin( tuv.x * frequency * 1.5 + speed ) / ( amplitude * .5 );
        
                    vec3 layer1 = mix( u_color_0, u_color_1, S( -0.3, .2, ( tuv * Rot( radians( u_rand_1 ))).x));
                    vec3 layer2 = mix( u_color_2, u_color_3, S( -0.3, .2, ( tuv * Rot( radians( u_rand_2 ))).x));
                    
                    vec3 finalComp = mix( layer1, layer2, S( 0.5, -0.3, tuv.y ) );
                    
                    gl_FragColor = vec4( finalComp, 1.0 );
                }
            `,
			uniforms: {
				u_time: { value: 0 },
				u_resolution: { value: new Vec2(this.canvasW * 2, this.canvasH * 2) },
				u_color_0: { value: new Color(this.palette[0]) },
				u_color_1: { value: new Color(this.palette[1]) },
				u_color_2: { value: new Color(this.palette[2]) },
				u_color_3: { value: new Color(this.palette[3]) },
				u_scale: { value: 1.3 },
				u_rand_1: { value: 0 },
				u_rand_2: { value: 0 }
			}
		})

		this.rttPlane = new Mesh(this.gl, { geometry: this.rttPlaneGeo, program: this.rttProgram })
		this.isRenderTarget = true
	}

	_resetSeed() {
		this.rttProgram.uniforms.u_rand_1.value = this.rng() * 200 - 100
		this.rttProgram.uniforms.u_rand_2.value = this.rng() * 200 - 100
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
	}

	_animate() {
		this.rttProgram.uniforms.u_time.value = Math.sin(this.frame / 200) * 10
	}

	update(option, val) {
		switch (option) {
			case "noise":
				this._planeShader.uniforms.uNoiseFactor.value = parseFloat(val)
				break
		}
	}
}
