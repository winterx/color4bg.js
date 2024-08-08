import { Plane, Program, Mesh, RenderTarget, Camera, Vec2, Color } from "../../ogl/src/index.js"
import { ColorBg } from "../ColorBg.js"
import shader from "./shaders/ChaosWaves.js"

export class ChaosWavesBg extends ColorBg {
	constructor(params = {}) {
		super(params, 6)
		this.name = "chaos-waves"

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
			fragment: shader,

			uniforms: {
				u_time: { value: 0 },
				u_resolution: { value: new Vec2(this.canvasW * 2, this.canvasH * 2) },
				u_expand: { value: 6.0 },
				u_random: { value: this.rng() * 10 + 5 },
				u_color_0: { value: new Color(this.palette[0]) },
				u_color_1: { value: new Color(this.palette[1]) },
				u_color_2: { value: new Color(this.palette[2]) },
				u_color_3: { value: new Color(this.palette[3]) },
				u_color_4: { value: new Color(this.palette[4]) },
				u_color_5: { value: new Color(this.palette[5]) },
			}
		})

		this.rttPlane = new Mesh(this.gl, { geometry: this.rttPlaneGeo, program: this.rttProgram })
		this.isRenderTarget = true
	}

	_resetSeed() {
		this.rttProgram.uniforms.u_random.value = this.rng()
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
				this.speed = (v * -480) / 19 + 9980 / 19
                console.log(this.speed);
                
				break
		}
	}
}
