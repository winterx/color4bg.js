import { Plane, Program, Mesh, Vec2, Color } from "../../ogl/src/index.js"
import { ColorBg } from "../ColorBg.js"

export class WavyWavesBg extends ColorBg {
	constructor(params = {}) {
		super(params, 6)

		this.options = this.params.options || {}

		this.start()
	}

	_size() {
		this.size = this.canvasW > this.canvasH ? this.canvasW : this.canvasH
	}

	_resetSeed() {
		if (this._planeShader) {
			this._planeShader.uniforms.u_scale.value = this.rng() * 10 + 5
		}
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
                #ifdef GL_ES
                precision mediump float;
                #endif

                uniform vec2 u_resolution;
                uniform float u_time;
                uniform float u_expand;
                uniform float u_scale;

                varying vec2 vUv;

                float f(in vec2 p)
                {
                    //return sin(p.x+sin(p.y+u_time*0.1)) * sin(p.y*p.x*0.1+u_time*0.2);
                    return sin( p.x + sin( p.y + u_time ) ) * sin( p.y * p.x * 0.1 + u_time );
                }


                //---------------Field to visualize defined here-----------------
                vec2 field(in vec2 p)
                {
                    vec2 ep = vec2(.05,0.);
                    vec2 rz= vec2(0);
                    for( int i=0; i<7; i++ )
                    {
                    float t0 = f(p);
                    float t1 = f(p + ep.xy);
                    float t2 = f(p + ep.yx);
                    vec2 g = vec2((t1-t0), (t2-t0))/ep.xx;
                    vec2 t = vec2(-g.y,g.x);
                        
                    p += 0.9 * t + g * 0.3;
                    rz= t;
                    }
                    
                    return rz;
                }

                uniform vec3 u_color_0;
                uniform vec3 u_color_1;
                uniform vec3 u_color_2;
                uniform vec3 u_color_3;
                uniform vec3 u_color_4;
                uniform vec3 u_color_5;

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
                    
                    float R1 = smoothstep( 1., -0.0, P1 * u_expand) / 1.;
                    float R2 = smoothstep( 1., -0.0, P2 * u_expand) / 1.;
                    float R3 = smoothstep( 1., -0.0, P3 * u_expand) / 1.;
                    float R4 = smoothstep( 1., -0.0, P4 * u_expand) / 1.;
                    float R5 = smoothstep( 1., -0.0, P5 * u_expand) / 1.;
                    float R6 = smoothstep( 1., -0.0, P6 * u_expand) / 1.;
                    float R7 = smoothstep( 1., -0.0, P7 * u_expand) / 1.;
                    
                    color = u_color_0 * R1 + 
                            u_color_1 * R2 +
                            u_color_2 * R3 +
                            u_color_3 * R4 +
                            u_color_4 * R5 + 
                            u_color_5 * R6 +
                            u_color_0 * R7;
                    
                    return color;
                }

                void main()
                {
                    vec2 p = gl_FragCoord.xy / u_resolution.xy-0.5;
                    p.x *= u_resolution.x/u_resolution.x;
                    p *= u_scale;
                
                    vec2 fld = field(p);
                    
                    float factor = (1. - fld.y) * (0.5 - fld.x);
                    vec3 col = lut( factor );
                    
                    gl_FragColor = vec4(col,1.0);
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
				u_expand: { value: 6.0 },
				u_scale: { value: this.rng() * 10 + 5 }
			}
		})
	}

	_make() {
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

	_resetColors() {
		this._planeShader.uniforms.u_color_0.value = new Color(this.palette[0])
		this._planeShader.uniforms.u_color_1.value = new Color(this.palette[1])
		this._planeShader.uniforms.u_color_2.value = new Color(this.palette[2])
		this._planeShader.uniforms.u_color_3.value = new Color(this.palette[3])
		this._planeShader.uniforms.u_color_4.value = new Color(this.palette[4])
		this._planeShader.uniforms.u_color_5.value = new Color(this.palette[5])
	}

	_animate() {
		this._planeShader.uniforms.u_time.value = this.frame / 100
	}
}
