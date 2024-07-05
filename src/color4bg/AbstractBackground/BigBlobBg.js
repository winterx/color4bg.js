import { Program, Plane, Mesh, Vec2, Vec3, Vec4, Color, RenderTarget, Camera } from "../../ogl/src/index.js"
import { ColorBg } from "../ColorBg.js"
import { Sphere } from "../../ogl/src/extras/Sphere.js"
import { BlobMorph } from "../../ogl/src/utils/BlobMorph.js"

export class BigBlobBg extends ColorBg {
	constructor(params = {}) {
		super(params, 6)

		this.options = this.params.options || {}

		this.blobs = []

		this.start()
	}

	_size() {
		this.radius = this.canvasW / 4
	}

	_resetSeed() {
		this.blobs = []

		for (let i = 0; i < 4; i++) {
			let angle = this.rng() * Math.PI * 2
			let anchorX = this.radius * Math.cos(angle)
			let anchorY = this.radius * Math.sin(angle)

			let moveToX = this.radius * (1.0 + this.rng() / 4) * Math.cos(angle)
			let moveToY = this.radius * (1.0 + this.rng() / 4) * Math.sin(angle)

			this.blobs.push({
				anchorX,
				anchorY,
				moveToX,
				moveToY
			})
		}
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

	_makeMaterial() {
		this._planeShader = new Program(this.gl, {
			vertex: `
				attribute vec2 uv;
				attribute vec3 position;
				uniform mat4 modelViewMatrix;
				uniform mat4 projectionMatrix;
				varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragment: `
				precision highp float;
                uniform vec3 u_color_0;
				varying vec2 vUv;
				void main() {
					gl_FragColor = vec4(u_color_0, 1.0);
				}
			`,
			uniforms: {
				u_color_0: { value: new Color(this.palette[0]) }
			}
		})

		this._blobShader = new Program(this.gl, {
			vertex: /* glsl */ `
                attribute vec3 position;
                attribute vec3 normal;
                attribute vec2 uv;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                uniform mat3 normalMatrix;
                uniform vec3 uLightDirection;
                uniform vec3 uLightDiffuse;
                varying vec2 vUv;
                varying float lambertTerm;
                void main() {
                    vUv = uv;

                    vec3 N = normalize( vec3( normalMatrix * normal ) );
                    vec3 L = normalize( uLightDirection );
        
                    lambertTerm = dot( N, -L );
        
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
			fragment: /* glsl */ `
				precision highp float;
				uniform sampler2D tMap;
				uniform float uTime;
				uniform float uMagnitude;

                uniform vec3 uLightDirection;
                uniform vec3 uLightDiffuse;

				varying vec2 vUv;
                varying float lambertTerm;
                const float speed = 15.0;
				
				void main() {
					vec2 wavyCoord;
					wavyCoord.s = vUv.s + (sin(uTime+vUv.t*speed) * uMagnitude);
					wavyCoord.t = vUv.t + (cos(uTime+vUv.s*speed) * uMagnitude);
					vec4 frameColor = texture2D(tMap, wavyCoord);
                    float l = lambertTerm * 1.47;
                    vec3 finalColor = frameColor.rgb * (l) + uLightDiffuse * (1.0 - l);
					gl_FragColor = vec4(finalColor.rgb, 1.0);
				}
            `,
			uniforms: {
				tMap: { value: this.rtt.texture },
				uTime: { value: 0 },
				uMagnitude: { value: 0.15 },
				uLightDirection: { value: new Vec3(0, 0, -1) },
				uLightDiffuse: { value: new Color(this.palette[0]) }
			}
		})
	}

	_make() {
		// BACKGROUND
		const planeGeometry = new Plane(this.gl, {
			width: this.canvasW,
			height: this.canvasH
		})
		const plane = new Mesh(this.gl, { geometry: planeGeometry, program: this._planeShader })
		plane.setParent(this.scene)

		// BLOB
		this.blob_geo = new Sphere(this.gl, {
			radius: this.radius,
			widthSegments: 128,
			heightSegments: 128
		})

		for (let i = 0; i < 4; i++) {
			let blob = this.blobs[i]
			let convex2 = new BlobMorph(blob.anchorX, blob.anchorY, 0, this.radius)
			convex2.surround(this.blob_geo)
			convex2.moveTo(blob.moveToX, blob.moveToY, 0)
		}

		this.blob = new Mesh(this.gl, {
			// mode: this.gl.LINES,
			geometry: this.blob_geo,
			program: this._blobShader
		})

		this.blob.setParent(this.scene)
	}

	_resetColors() {
		this._planeShader.uniforms.u_color_0.value = new Color(this.palette[0])
		this.rttProgram.uniforms.u_color_0.value = new Color(this.palette[0])
		this.rttProgram.uniforms.u_color_1.value = new Color(this.palette[1])
		this.rttProgram.uniforms.u_color_2.value = new Color(this.palette[2])
		this.rttProgram.uniforms.u_color_3.value = new Color(this.palette[3])
		this.rttProgram.uniforms.u_color_4.value = new Color(this.palette[4])
		this.rttProgram.uniforms.u_color_5.value = new Color(this.palette[5])
		this._blobShader.uniforms.uLightDiffuse.value = new Color(this.palette[0])
	}

	_animate() {
		this._blobShader.uniforms.uTime.value = this.frame / 50
	}
}
