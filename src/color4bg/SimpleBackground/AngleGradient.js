import { Plane, Program, Mesh, Vec2, Color } from "../../ogl/src/index.js"
import { ColorBg } from "../ColorBg.js"
import seed from "../../ogl/src/utils/SeedRandom.js"

export class Bg extends ColorBg {
	constructor(params = {}) {
		super(params)

		seed()

		this.makeMaterial()

		this.draw()
	}

	makeMaterial() {
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
                #ifdef GL_ES
                precision mediump float;
                #endif

                varying vec2 vUv;

                #define TWO_PI 6.28318530718

                uniform float p1;
                uniform float p2;
                uniform float scale;

                uniform float pos_x;
                uniform float pos_y;

                uniform vec2 u_resolution;
                uniform float u_time;

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
                    
                    float R1 = smoothstep( 1., -0.0, P1 * scale) / 1.;
                    float R2 = smoothstep( 1., -0.0, P2 * scale) / 1.;
                    float R3 = smoothstep( 1., -0.0, P3 * scale) / 1.;
                    float R4 = smoothstep( 1., -0.0, P4 * scale) / 1.;
                    float R5 = smoothstep( 1., -0.0, P5 * scale) / 1.;
                    float R6 = smoothstep( 1., -0.0, P6 * scale) / 1.;
                    float R7 = smoothstep( 1., -0.0, P7 * scale) / 1.;
                    
                    color = u_color_0 * R1 + 
                            u_color_1 * R2 +
                            u_color_2 * R3 +
                            u_color_3 * R4 +
                            u_color_4 * R5 + 
                            u_color_5 * R6 +
                            u_color_0 * R7;
                    
                    return color;
                }


                vec2 rotate2D(vec2 uv, float angle) {
                    float s = sin(angle);
                    float c = cos(angle);
                    mat2 rotationMatrix = mat2(c, -s, s, c);
                    return rotationMatrix * uv;
                }


                void main() {
                    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                    uv = vUv;
                    
                    vec2 toCenter = vec2( pos_x, pos_y ) - uv;
                        toCenter = rotate2D( toCenter, u_time );
                    
                    float ca = ( atan(toCenter.x, toCenter.y) * p1 + p2 ) /3.1415926;
                    
                    vec3 color2 = lut(ca);
                    vec3 color3 = vec3(ca);
                    
                    gl_FragColor = vec4(color2, 1.0);
                }
            `,
			uniforms: {
				u_time: { value: 0 },
				u_resolution: { value: new Vec2(this.canvasW, this.canvasH) },
				u_color_0: { value: new Color(this.palette[0]) },
				u_color_1: { value: new Color(this.palette[1]) },
				u_color_2: { value: new Color(this.palette[2]) },
				u_color_3: { value: new Color(this.palette[3]) },
                u_color_4: { value: new Color(this.palette[4]) },
                u_color_5: { value: new Color(this.palette[5]) },
                p1: { value: 0.5 },
                p2: { value: 1.57 },
                pos_x: { value: 0.5 },
                pos_y: { value: 0.5 },
                scale: { value: 6.0 }
			}
		})
	}

	draw() {
		this.size = this.canvasW > this.canvasH ? this.canvasW : this.canvasH

		const planeGeo = new Plane(this.gl, {
			width: this.size,
			height: this.size
		})

		const plane = new Mesh(this.gl, {
			geometry: planeGeo,
			program: this._planeShader
		})

		plane.setParent(this.scene)
	}

	animate() {
		this._planeShader.uniforms.u_time.value = this.frame / 100
	}
}
