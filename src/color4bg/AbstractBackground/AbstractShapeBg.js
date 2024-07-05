import { Plane, Program, Mesh, Texture, RenderTarget, Camera, Color } from "../../ogl/src/index.js"
import { ColorBg } from "../ColorBg.js"
import { CanvasAbstractShapes } from "../../ogl/src/utils/CanvasAbstract.js"

export class AbstractShapeBg extends ColorBg {
	constructor(params = {}) {
		super(params, 6)

		this.options = this.params.options || {
			noise: 0.05
		}

		this.canvasManager = new CanvasAbstractShapes(this.canvasW, this.canvasH, this.palette)
		this.texture = new Texture(this.gl)
		this.img = new Image()

		this.start()
	}

	_resetSeed() {
		this.canvasManager.reset(this.rng)
		this._loadCanvas()
	}

	_loadCanvas() {
		this.img.src = this.canvasManager.getCanvasData()
		this.img.onload = () => {
			this.texture.image = this.img
			this.texture.needsUpdate = true
			// canvasManager.destroy()
		}
	}

	_makeMaterial() {
		this._planeShader = new Program(this.gl, {
			vertex: /* glsl */ `
                #ifdef GL_ES
                precision mediump float;
                #endif

                attribute vec3 position;
                attribute vec2 uv;

                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
				uniform float uTime;
				uniform float uWavy;
                varying vec2 vUv;

                void main() {
                    vUv = uv;

					vec2 wavyCoord;
					wavyCoord.s = sin( uTime + vUv.t * 15.0 );
					wavyCoord.t = cos( uTime + vUv.s * 15.0 );

					vec3 pos = position;
					pos.x += wavyCoord.s * uWavy;
					pos.y += wavyCoord.t * uWavy;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
			fragment: /* glsl */ `
                #ifdef GL_ES
                precision mediump float;
                #endif

				uniform sampler2D tMap;
				uniform float uNoiseAmount;
				uniform float uTime;
				uniform bool uAdd;
				uniform vec3 u_color_0;

                varying vec2 vUv;

				float random(vec2 co) {
					return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
				}

				float blendScreen(float base, float blend) {
					return 1.0-((1.0-base)*(1.0-blend));
				}
				
				vec3 blendScreen(vec3 base, vec3 blend) {
					return vec3(blendScreen(base.r,blend.r),blendScreen(base.g,blend.g),blendScreen(base.b,blend.b));
				}

                void main() {
					vec4 color = texture2D(tMap, vUv);

					// if(uAdd) {
					// 	vec3 colorAdd = u_color_0 * sin(uTime + vUv.x / 0.2) / 2.;
					// 	color.rgb = blendScreen( color.rgb, colorAdd );
					// }

					float noise = (random(vUv) - 0.5) * uNoiseAmount;
					color.rgb = color.rgb + color.rgb * noise;

                    gl_FragColor = vec4(color.rgb, 1.0);
                }
            `,
			uniforms: {
				tMap: { value: this.texture },
				uNoiseAmount: { value: this.options.noise },
				uWavy: { value: 10.0 },
				uTime: { value: 0.0 },
				uAdd: { value: false },
				u_color_0: { value: new Color(this.palette[0]) }
			}
		})
	}

	_make() {
		const planeGeo = new Plane(this.gl, {
			width: this.canvasW * 1.06,
			height: this.canvasH * 1.06,
			widthSegments: 99,
			heightSegments: 99
		})

		this._plane = new Mesh(this.gl, {
			geometry: planeGeo,
			program: this._planeShader
		})

		this._plane.setParent(this.scene)
	}

	_resetColors() {
		this.canvasManager.colors(this.palette)
		this.canvasManager.draw()
		this._loadCanvas()
	}

	_animate() {
		this._planeShader.uniforms.uTime.value = this.frame / 50
	}

	update(option, val) {
		switch (option) {
			case "noise":
				this._planeShader.uniforms.uNoiseAmount.value = parseFloat(val)
				break

			case "wavy":
				this._planeShader.uniforms.uWavy.value = parseFloat(val)
				break
		}
	}
}
