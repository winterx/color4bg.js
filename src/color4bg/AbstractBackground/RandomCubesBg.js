import { Program, Plane, Mesh, Color } from "../../ogl/src/index.js"
import { Box } from "../../ogl/src/extras/Box.js"
import { ColorBg } from "../ColorBg.js"
import { Distribution } from "../../ogl/src/utils/Distribution.js"

export class RandomCubesBg extends ColorBg {
	constructor(params = {}) {
		super(params, 4)

		this.options = this.params.options || {}

		this.cubes = []
		this.cubesRandom = []

		this.start()
	}

	_size() {}

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

		this._cubeShader = new Program(this.gl, {
			vertex: /* glsl */ `
                attribute vec3 position;
                attribute vec2 uv;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;

                varying vec2 vUv;
				varying float vFogFactor;

				uniform float uFogStart;
				uniform float uFogEnd;

                void main() {
                    vUv = uv;
                    vec4 pos = modelViewMatrix * vec4(position, 1.0);

					float distance = length((modelViewMatrix * vec4(position, 1.0)).xyz);
    				vFogFactor = clamp((uFogEnd - distance) / (uFogEnd - uFogStart), 0.0, 1.0);

                    gl_Position = projectionMatrix * pos;
                }
            `,
			fragment: /* glsl */ `
				precision highp float;

				uniform float uTime;

                uniform vec3 uFogColor;
                uniform float uFogStart;
                uniform float uFogEnd;

                uniform vec3 u_color_0;
                uniform vec3 u_color_1;
                uniform vec3 u_color_2;
                uniform vec3 u_color_3;

				varying vec2 vUv;
				varying float vFogFactor;
				
				void main() {
                    vec2 uv = vUv;

                    vec3 col = mix(
                        mix(u_color_3, u_color_1, uv.x ),
                        mix(u_color_2, u_color_3, uv.x ),
                        uv.y
                    );

					col = mix( col, u_color_0, uv.y * uv.y );
					col = mix( col, u_color_1, uv.y * uv.y );
					col = mix( col, u_color_2, uv.x * uv.x );
					col = mix( col, u_color_3, uv.x * uv.x );

                    col = mix(col, uFogColor, vFogFactor);

					gl_FragColor = vec4(col, 1.0);
				}
            `,
			uniforms: {
				uTime: { value: 0 },
				uFogColor: { value: new Color(this.palette[0]) },
				uFogStart: { value: 7800 },
				uFogEnd: { value: 7000 },
				u_color_0: { value: new Color(this.palette[0]) },
				u_color_1: { value: new Color(this.palette[1]) },
				u_color_2: { value: new Color(this.palette[2]) },
				u_color_3: { value: new Color(this.palette[3]) }
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
		plane.position.z = -2000

		// CUBES
		const distribution = new Distribution(this.canvasW, this.canvasH, this.seed)
		let array = distribution.result

		for (let i = 0; i < array.length; i++) {
			let rect = array[i]
			let ratio = rect.w / rect.h
			let size = ratio > 1 ? rect.h : rect.w

			if (ratio > 1) {
				rect.pos_x += ((this.rng() * 2 - 1) * rect.w) / 2
			} else {
				rect.pos_y += ((this.rng() * 2 - 1) * rect.h) / 2
			}

			size *= 0.8

			const cubeGeometry = new Box(this.gl, {
				width: size,
				height: size,
				depth: size
			})

			const cube = new Mesh(this.gl, {
				// mode: this.gl.LINES,
				geometry: cubeGeometry,
				program: this._cubeShader
			})

			cube.position.set(rect.pos_x, rect.pos_y, 1000 * ratio)

			cube.setParent(this.scene)

			let ranRotX = this.rng() * 0.8 - 0.4
			let ranRotY = this.rng() * 1.2 - 0.6
			let ranRotZ = this.rng() * 0.4 - 0.2

			this.cubes.push(cube)
			this.cubesRandom.push({
				ranRotX,
				ranRotY,
				ranRotZ
			})
		}

		// for (let i = 0; i < 50; i++) {
		// 	const cubeGeometry = new Box(this.gl, {
		// 		width: 10,
		// 		height: 10,
		// 		depth: 10
		// 	})

		// 	this.cube = new Mesh(this.gl, {
		// 		geometry: cubeGeometry,
		// 		program: this._cubeShader
		// 	})
		// 	this.cube.position.set(i * 20 - (20 * 50 / 2), -100, i * 100)

		// 	this.cube.setParent(this.scene)
		// }
	}

	_resetColors() {
		this._planeShader.uniforms.u_color_0.value = new Color(this.palette[0])
		this._cubeShader.uniforms.uFogColor.value = new Color(this.palette[0])
		this._cubeShader.uniforms.u_color_0.value = new Color(this.palette[0])
		this._cubeShader.uniforms.u_color_1.value = new Color(this.palette[1])
		this._cubeShader.uniforms.u_color_2.value = new Color(this.palette[2])
		this._cubeShader.uniforms.u_color_3.value = new Color(this.palette[3])
	}

	_animate() {
		for (let i = 0; i < this.cubes.length; i++) {
			this.cubes[i].rotation.x = Math.sin((this.frame + i * 500) / 100) / 4 + this.cubesRandom[i].ranRotX
			this.cubes[i].rotation.y = Math.sin((this.frame + i * 800) / 100) / 4 + this.cubesRandom[i].ranRotY
			this.cubes[i].rotation.z = Math.sin((this.frame + i * 1200) / 100) / 4 + this.cubesRandom[i].ranRotZ
		}
	}

	start_(v) {
		this._cubeShader.uniforms.uFogStart.value = v
	}
	end_(v) {
		this._cubeShader.uniforms.uFogEnd.value = v
	}
}
