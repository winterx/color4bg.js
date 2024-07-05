import { Geometry, Program, Mesh, Vec3, Color } from "../../ogl/src/index.js"
import { ColorBg } from "../ColorBg.js"

export class TrianglesMosaicBg extends ColorBg {
	constructor(params = {}) {
		super(params, 6)

		this.options = this.params.options || {}

		this.speed = 100
		this.scale = 1
		this.factor = 1

		this.start()
	}

	_size() {}

	_resetSeed() {
		this.factor = this.rng()
	}

	_makeMaterial() {
		this._planeShader = new Program(this.gl, {
			vertex: /* glsl */ `
                attribute vec3 position;
                attribute vec3 color;
                attribute vec2 uv;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
				uniform float uTime;
                varying vec2 vUv;
                varying vec3 vColor;
                void main() {
                    vUv = uv;
                    vColor = color;
                    vec3 pos = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
			fragment: /* glsl */ `
				precision highp float;

				uniform sampler2D tMap;
				uniform float uTime;
                uniform float uNoiseFactor;
				uniform float uScale;

                uniform vec3 u_color_0;
                uniform vec3 u_color_1;
                uniform vec3 u_color_2;
                uniform vec3 u_color_3;
                uniform vec3 u_color_4;
                uniform vec3 u_color_5;
    
                const vec3 C1 = vec3(0.0, 1.0, 1.0 );
                const vec3 C2 = vec3(1.0, 1.0, 0.0 );
                const vec3 C3 = vec3(0.0, 1.0, 0.0 );
                const vec3 C4 = vec3(0.0, 1.0, 1.0 );
                const vec3 C5 = vec3(0.0, 0.0, 1.0 );
                const vec3 C6 = vec3(1.0, 0.0, 1.0 );
    
                const float x1 = 0.0;
                const float x2 = 0.167;
                const float x3 = 0.334;
                const float x4 = 0.500;
                const float x5 = 0.667;
                const float x6 = 0.833;
                const float x7 = 1.0;

				varying vec2 vUv;
                varying vec3 vColor;

                vec3 lut( float x ) {

                    if(x<0.0 || x>1.0)
                        return u_color_0;
    
                    vec3 color = vec3(1.0);

                    float P1 = abs(x - x1);
                    float P2 = abs(x - x2);
                    float P3 = abs(x - x3);
                    float P4 = abs(x - x4);
                    float P5 = abs(x - x5);
                    float P6 = abs(x - x6);
                    float P7 = abs(x - x7);

                    float R1 = smoothstep( 1., -0.0, P1 * uScale) / 1.;
                    float R2 = smoothstep( 1., -0.0, P2 * uScale) / 1.;
                    float R3 = smoothstep( 1., -0.0, P3 * uScale) / 1.;
                    float R4 = smoothstep( 1., -0.0, P4 * uScale) / 1.;
                    float R5 = smoothstep( 1., -0.0, P5 * uScale) / 1.;
                    float R6 = smoothstep( 1., -0.0, P6 * uScale) / 1.;
                    float R7 = smoothstep( 1., -0.0, P7 * uScale) / 1.;

                    color = u_color_0 * R1 + 
                            u_color_1 * R2 +
                            u_color_2 * R3 +
                            u_color_3 * R4 +
                            u_color_4 * R5 + 
                            u_color_5 * R6 +
                            u_color_0 * R7;

                    return color;
                }

				float random(vec2 co) {
					return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
				}
				
				void main() {
                    float f = sin(uTime + vColor.x * 10.) * 0.5 + 0.5;

                    vec3 color = lut(f);

					float noise = (random(vUv) - 0.5) * uNoiseFactor;
					color.rgb = color.rgb + color.rgb * noise;

					gl_FragColor = vec4( color, 1.0 );
				}
            `,
			uniforms: {
				uTime: { value: 0 },
				uScale: { value: 6.0 },
				uNoiseFactor: { value: 0.1 },
				u_color_0: { value: new Color(this.palette[0]) },
				u_color_1: { value: new Color(this.palette[1]) },
				u_color_2: { value: new Color(this.palette[2]) },
				u_color_3: { value: new Color(this.palette[3]) },
				u_color_4: { value: new Color(this.palette[4]) },
				u_color_5: { value: new Color(this.palette[5]) }
			}
		})
	}

	_make() {
		// 首先，构造由三角面构成的网格的位置群 points
		let points = []

		let xNum = Math.floor((this.canvasW * 12) / 100) + 2
		let yNum = Math.floor((this.canvasH * 12) / 100) + 2

		let total = xNum * yNum

		for (let y = 0; y < yNum; y++) {
			for (let x = 0; x < xNum; x++) {
				let px = x * 100 - (this.canvasW * 12) / 2
				let py = y * -100 + (this.canvasH * 12) / 2

				if (x > 0 && x < xNum - 1 && y > 0 && y < yNum - 1) {
					px += (this.rng() * 100 - 50) * this.factor
					py += (this.rng() * 100 - 50) * this.factor
				}

				let p = new Vec3(px, py, 0)

				points.push(p)
			}
		}

		// 然后，根据位置群 points 来生成三角面几何体
		const positions = []
		const normals = []
		const colors = []
		const uvs = []

		for (let i = 0; i < total; i++) {
			let p = points[i]

			let jiggerZ = this.rng() * 200 - 100

			let rightX, rightY

			if (i == points.length - 1) {
				rightX = points[i].x + 100
				rightY = points[i].y
			} else if (i % xNum == xNum - 1) {
				rightX = points[i].x + 100
				rightY = points[i].y
			} else {
				rightX = points[i + 1].x
				rightY = points[i + 1].y
			}

			let downX, downY

			if (i == points.length - 1) {
				downX = points[i].x
				downY = points[i].y - 100
			} else if (points[i + xNum]) {
				downX = points[i + xNum].x
				downY = points[i + xNum].y
			} else {
				downX = points[i].x
				downY = points[i].y - 100
			}

			let diagX, diagY

			if (i == points.length - 1) {
				diagX = points[i].x + 100
				diagY = points[i].y - 100
			} else if (points[i + xNum] && (i % xNum) + 1 < xNum) {
				diagX = points[i + xNum + 1].x
				diagY = points[i + xNum + 1].y
			} else {
				diagX = points[i].x + 100
				diagY = points[i].y - 100
			}

			// triangular 1
			positions.push(p.x)
			positions.push(p.y)
			positions.push(0)

			positions.push(downX)
			positions.push(downY)
			positions.push(jiggerZ)

			positions.push(rightX)
			positions.push(rightY)
			positions.push(0)

			// triangular 2
			positions.push(rightX)
			positions.push(rightY)
			positions.push(0)

			positions.push(downX)
			positions.push(downY)
			positions.push(jiggerZ)

			positions.push(diagX)
			positions.push(diagY)
			positions.push(0)

			// color 1
			let c1 = this.rng()
			let c2 = this.rng()
			colors.push(c1)
			colors.push(c1)
			colors.push(c1)

			colors.push(c1)
			colors.push(c1)
			colors.push(c1)

			colors.push(c1)
			colors.push(c1)
			colors.push(c1)

			// color 2
			colors.push(c2)
			colors.push(c2)
			colors.push(c2)

			colors.push(c2)
			colors.push(c2)
			colors.push(c2)

			colors.push(c2)
			colors.push(c2)
			colors.push(c2)

			// uv
			uvs.push(p.x / this.canvasW)
			uvs.push(p.y / this.canvasH)

			uvs.push(downX / this.canvasW)
			uvs.push(downY / this.canvasH)

			uvs.push(rightX / this.canvasW)
			uvs.push(rightY / this.canvasH)

			// uv
			uvs.push(p.x / this.canvasW)
			uvs.push(p.y / this.canvasH)

			uvs.push(downX / this.canvasW)
			uvs.push(downY / this.canvasH)

			uvs.push(rightX / this.canvasW)
			uvs.push(rightY / this.canvasH)
		}

		const planeGeo = new Geometry(this.gl, {
			position: {
				size: 3,
				data: new Float32Array(positions)
			},
			color: {
				size: 3,
				data: new Float32Array(colors)
			},
			uv: {
				size: 2,
				data: new Float32Array(uvs)
			}
		})

		const plane = new Mesh(this.gl, {
			// mode: this.gl.LINES,
			geometry: planeGeo,
			program: this._planeShader
		})

		plane.setParent(this.scene)
	}

	_resetColors() {
		this._planeShader.uniforms.u_color_0.value = new Color(this.palette[0])
		this._planeShader.uniforms.u_color_1.value = new Color(this.palette[1])
		this._planeShader.uniforms.u_color_2.value = new Color(this.palette[2])
		this._planeShader.uniforms.u_color_3.value = new Color(this.palette[3])
		this._planeShader.uniforms.u_color_4.value = new Color(this.palette[4])
		this._planeShader.uniforms.u_color_5.value = new Color(this.palette[5])
	}

	_animate() {
		this._planeShader.uniforms.uTime.value = this.frame / this.speed
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

			case "factor":
				this.factor = parseFloat(val)
				break
		}
	}
}
