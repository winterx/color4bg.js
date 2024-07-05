import { Plane, Program, Mesh, RenderTarget, Camera, Vec2, Color } from "../../ogl/src/index.js"
import { ColorBg } from "../ColorBg.js"

export class BlurDotBg extends ColorBg {
	constructor(params = {}) {
		super(params, 4)

		this.options = this.params.options || {}
		this.ratio
		this.rect
		this.move = [0, 0, 0, 0]

		this.start()
	}

	_size() {
		this.ratio = this.canvasW / this.canvasH
		this.rect = new Vec2(this.ratio / 2, 1.0 / 2)
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
            
                #define TWO_PI 6.28318530718
            
                uniform float u_time;
                uniform vec2 u_resolution;
                uniform float u_ratio;
            
                uniform vec3 u_color_0;
                uniform vec3 u_color_1;
                uniform vec3 u_color_2;
                uniform vec3 u_color_3;

                uniform float u_p0_s;
                uniform float u_p1_s;
                uniform float u_p2_s;
                uniform float u_p3_s;
            
                uniform float u_p0x;
                uniform float u_p0y;
            
                uniform float u_p1x;
                uniform float u_p1y;
            
                uniform float u_p2x;
                uniform float u_p2y;
            
                uniform float u_p3x;
                uniform float u_p3y;
            
            
                vec4 blurDot ( vec3 color, vec2 st, vec2 pos, float inner, float outer ) {
                        
                    float pct = distance( st, pos );
                    
                    float alpha = 1. - smoothstep( inner, outer, pct );
                        
                    return vec4( color.rgb, alpha );
                }
            
                vec3 blendColor ( vec3 color_0, vec3 color_1, float alpha ) {
            
                    vec3 color = color_0 * ( 1.05 - alpha ) + color_1 * alpha;
            
                    return color;
            
                }
            
                void main(){

                    vec2 st = gl_FragCoord.xy / u_resolution;
                    st.x *= u_ratio;
                    st.x -= u_ratio / 2.;
                    st.y -= 0.5;

                    vec3 color = vec3(1.0);
                    
                    vec4 dot_color_0 = blurDot( u_color_0, st, vec2( u_p0x, u_p0y ), 0.1, u_p0_s );
                    vec4 dot_color_1 = blurDot( u_color_1, st, vec2( u_p1x, u_p1y ), 0.1, u_p1_s );
                    vec4 dot_color_2 = blurDot( u_color_2, st, vec2( u_p2x, u_p2y ), 0.1, u_p2_s );
                    vec4 dot_color_3 = blurDot( u_color_3, st, vec2( u_p3x, u_p3y ), 0.1, u_p3_s );
                    
                    color = blendColor( color, dot_color_3.rgb, dot_color_3.a );
                    color = blendColor( color, dot_color_2.rgb, dot_color_2.a );
                    color = blendColor( color, dot_color_1.rgb, dot_color_1.a );
                    color = blendColor( color, dot_color_0.rgb, dot_color_0.a );
                    
                    gl_FragColor = vec4(color,1.0);
                }
			`,
			uniforms: {
				u_time: { value: 0.0 },
				u_resolution: { value: new Vec2(512, 512) },
				u_ratio: { value: this.ratio },

				u_p0x: { value: -this.rect.x * 0.6 },
				u_p0y: { value: -this.rect.y * 0.3 },

				u_p1x: { value: -this.rect.x * 0.3 },
				u_p1y: { value: this.rect.y * 0.3 },

				u_p2x: { value: this.rect.x * 0.3 },
				u_p2y: { value: -this.rect.y * 0.3 },

				u_p3x: { value: this.rect.x * 0.6 },
				u_p3y: { value: this.rect.y * 0.3 },

				u_p0_s: { value: this.p0_s },
				u_p1_s: { value: this.p1_s },
				u_p2_s: { value: this.p2_s },
				u_p3_s: { value: this.p3_s },

				u_color_0: { value: new Color(this.palette[0]) },
				u_color_1: { value: new Color(this.palette[1]) },
				u_color_2: { value: new Color(this.palette[2]) },
				u_color_3: { value: new Color(this.palette[3]) }
			}
		})

		this.rttPlane = new Mesh(this.gl, { geometry: this.rttPlaneGeo, program: this.rttProgram })
		this.isRenderTarget = true
	}

	_resetSeed() {
		this.rttProgram.uniforms.u_p0_s.value = this.rng() + 0.8
		this.rttProgram.uniforms.u_p1_s.value = this.rng() + 0.8
		this.rttProgram.uniforms.u_p2_s.value = this.rng() + 0.8
		this.rttProgram.uniforms.u_p3_s.value = this.rng() + 0.8

		this.move[0] = Math.floor( this.rng() * 100 )
		this.move[1] = Math.floor( this.rng() * 100 )
		this.move[2] = Math.floor( this.rng() * 100 )
		this.move[3] = Math.floor( this.rng() * 100 )
	}

	_makeMaterial() {
		this.planeShader = new Program(this.gl, {
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
				uniform float uTime;

				float random(vec2 co) {
					return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
				}

				varying vec2 vUv;
				
				void main() {
					vec4 color = texture2D(tMap, vUv);

					float noise = (random(vUv) - 0.5) * 0.1;
					color.rgb = color.rgb + color.rgb * noise;

					gl_FragColor = color;
				}
            `,
			uniforms: {
				tMap: { value: this.rtt.texture },
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
			// mode: this.gl.LINES,
			geometry: planeGeo,
			program: this.planeShader
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
		this.rttProgram.uniforms["u_p0x"].value = Math.cos((this.frame + this.move[0]) / 150) * this.rect.x
		this.rttProgram.uniforms["u_p0y"].value = Math.sin((this.frame + this.move[0]) / 300) * this.rect.y

		this.rttProgram.uniforms["u_p1x"].value = Math.sin((this.frame + this.move[1]) / 300) * this.rect.x
		this.rttProgram.uniforms["u_p1y"].value = Math.cos((this.frame + this.move[1]) / 200) * this.rect.y

		this.rttProgram.uniforms["u_p2x"].value = Math.cos((this.frame + this.move[2]) / 200) * this.rect.x
		this.rttProgram.uniforms["u_p2y"].value = Math.cos((this.frame + this.move[2]) / 300) * this.rect.y

		this.rttProgram.uniforms["u_p3x"].value = Math.sin((this.frame + this.move[3]) / 150) * this.rect.x
		this.rttProgram.uniforms["u_p3y"].value = Math.sin((this.frame + this.move[3]) / 200) * this.rect.y
	}
}
