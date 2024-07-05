import { Plane, Program, Mesh, RenderTarget, Camera, Vec2, Vec4, Color } from "../../ogl/src/index.js"
import { ColorBg } from "../ColorBg.js"
import { MorphSurfaceConvex } from "../../ogl/src/utils/GeometryMorph.js"

export class AestheticFluidBg extends ColorBg {
	constructor(params = {}) {
		super(params, 6)

		this.options.radius_inner = params.radius_inner || 0.1
		this.options.radius_outer = params.radius_outer || 0.3

		console.log(this.options)

		this.morphdata = {
			1: {
				anchorX: 240,
				anchorY: -200,
				anchorZ: 0,
				anchorRadius: 900,
				moveToX: 260,
				moveToY: 160,
				moveToZ: 400
			},
			2: {
				anchorX: -240,
				anchorY: 200,
				anchorZ: 0,
				anchorRadius: 900,
				moveToX: -260,
				moveToY: -160,
				moveToZ: 400
			}
		}

		this.start()
	}

	_size() {
		this.size = this.canvasW > this.canvasH ? this.canvasW : this.canvasH
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

				uniform vec2 u_resolution;
				uniform float u_time;

				uniform vec3 u_color_0;
				uniform vec3 u_color_1;
				uniform vec3 u_color_2;
				uniform vec3 u_color_3;
				uniform vec3 u_color_4;
				uniform vec3 u_color_5;
				uniform vec4 u_dye_0;
				uniform vec4 u_dye_1;
				uniform vec4 u_dye_2;
				uniform vec4 u_dye_3;
				uniform vec4 u_dye_4;
				uniform vec4 u_dye_5;

				vec4 blurDot ( vec3 color, vec2 st, vec2 pos, float inner, float outer ) {
					float pct = distance( st, pos );   
					vec2 dist = st - pos;
					float alpha = 1. - smoothstep( inner, outer, pct );
						
					return vec4( color.rgb, alpha );
				}

				void main(){
					vec2 st = gl_FragCoord.xy/u_resolution;
					vec3 color = vec3(1.0);        

					vec4 dot_0 = blurDot( u_color_0, st, u_dye_0.xy, u_dye_0[2], u_dye_0[3] );
					vec4 dot_1 = blurDot( u_color_1, st, u_dye_1.xy, u_dye_1[2], u_dye_1[3] );
					vec4 dot_2 = blurDot( u_color_2, st, u_dye_2.xy, u_dye_2[2], u_dye_2[3] );
					vec4 dot_3 = blurDot( u_color_3, st, u_dye_3.xy, u_dye_3[2], u_dye_3[3] );
					vec4 dot_4 = blurDot( u_color_4, st, u_dye_4.xy, u_dye_4[2], u_dye_4[3] );
					vec4 dot_5 = blurDot( u_color_5, st, u_dye_5.xy, u_dye_5[2], u_dye_5[3] );
					

					color = mix( u_color_0, u_color_1, st.x );    
					color = mix( color, u_color_2, st.x*st.x + -0.040 );

					color = mix( color, dot_0.rgb, dot_0.a );
					color = mix( color, dot_1.rgb, dot_1.a );
					color = mix( color, dot_2.rgb, dot_2.a );
					color = mix( color, dot_3.rgb, dot_3.a );
					color = mix( color, dot_4.rgb, dot_4.a );
					color = mix( color, dot_5.rgb, dot_5.a );

					gl_FragColor = vec4(color,1.0);
				}
			`,
			uniforms: {
				u_time: { value: 0.0 },
				u_resolution: { value: new Vec2(512, 512) },
				u_color_0: { value: new Color(this.palette[0]) },
				u_color_1: { value: new Color(this.palette[1]) },
				u_color_2: { value: new Color(this.palette[2]) },
				u_color_3: { value: new Color(this.palette[3]) },
				u_color_4: { value: new Color(this.palette[4]) },
				u_color_5: { value: new Color(this.palette[5]) },
				u_dye_0: { value: new Vec4(0.3, 0.8, 0.1, 0.7) },
				u_dye_1: { value: new Vec4(0.7, 0.8, 0.1, 0.7) },
				u_dye_2: { value: new Vec4(0.7, 0.2, 0.1, 0.7) },
				u_dye_3: { value: new Vec4(0.3, 0.2, 0.1, 0.7) },
				u_dye_4: { value: new Vec4(0.1, 0.5, 0.1, 0.45) },
				u_dye_5: { value: new Vec4(0.9, 0.5, 0.1, 0.45) }
			}
		})

		this.rttPlane = new Mesh(this.gl, { geometry: this.rttPlaneGeo, program: this.rttProgram })
		this.isRenderTarget = true
	}

	_resetSeed() {
		for (let i = 0, l = 6; i < l; i++) {
			let x = this.rng()
			let y = this.rng()
			let inner = this.rng() * this.options.radius_inner + this.options.radius_inner
			let outer = this.rng() * this.options.radius_outer + this.options.radius_outer
			let dye = new Vec4(x, y, inner, outer)
			this.rttProgram.uniforms["u_dye_" + i] = { value: dye }
		}
	}

	_makeMaterial() {
		// 生成dye的样式

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
				uniform float uMagnitude;

				varying vec2 vUv;
				
				const float speed = 15.0;
				
				void main() {
					vec2 wavyCoord;
					wavyCoord.s = vUv.s + (sin(uTime+vUv.t*speed) * uMagnitude);
					wavyCoord.t = vUv.t + (cos(uTime+vUv.s*speed) * uMagnitude);
					vec4 frameColor = texture2D(tMap, wavyCoord);
					gl_FragColor = frameColor;
				}
            `,
			uniforms: {
				tMap: { value: this.rtt.texture },
				uTime: { value: 0 },
				uMagnitude: { value: 0.15 }
			}
		})
	}

	_make() {
		const planeGeo = new Plane(this.gl, {
			width: this.size,
			height: this.size,
			widthSegments: 99,
			heightSegments: 99
		})

		const plane = new Mesh(this.gl, {
			// mode: this.gl.LINES,
			geometry: planeGeo,
			program: this.planeShader
		})

		plane.setParent(this.scene)

		const morphdata = this.morphdata

		for (let index in morphdata) {
			let data = morphdata[index]

			let aX = data.anchorX
			let aY = data.anchorY
			let ra = data.anchorRadius

			let mX = data.moveToX
			let mY = data.moveToY

			const convex = new MorphSurfaceConvex(aX, aY, 0, ra)
			convex.surround(planeGeo)
			convex.moveTo(mX, mY, 400)
		}
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
		this.planeShader.uniforms.uTime.value = this.frame / 50
		// this.planeShader.uniforms.uMagnitude.value = Math.sin(this.frame/100) * 0.2 + 0.3
	}

	update(option, val) {
		switch (option) {
			case "scale":
				this.planeShader.uniforms.uMagnitude.value = parseFloat(val)
				break
		}
	}
}
