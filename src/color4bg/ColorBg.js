import { Renderer, Camera, Transform } from "../ogl/src/index.js"
import seed from "../ogl/src/utils/SeedRandom.js"
seed()

export class ColorBg {
	constructor(params = {}, num) {
		this.params = params

		this.options = {}

		this.loop = params.loop || false

		// Color init
		this.colors_num = num
		this.colors_init = params.colors || []
		this.palette = []
		this.colors(this.colors_init)

		// Seed random
		this.seed = params.seed || 1000
		this.rng = new Math.seedrandom(this.seed)

		// time track keyframe
		this.frame = 0

		// DOM
		this.parentDom = params.dom ? document.getElementById(params.dom) : document.body
		const parentDomStyle = window.getComputedStyle(this.parentDom);
		if (parentDomStyle.position === 'static') {
			this.parentDom.style.position = 'relative';
		}
		const wh = this._getParentRect(this.parentDom)
		this.canvasW = wh.w
		this.canvasH = wh.h

		// GL
		this.renderer = new Renderer()
		this.renderer.setSize(this.canvasW, this.canvasH)
		this.gl = this.renderer.gl
		this.gl.canvas.id = "colorbgcanvas"
		this.gl.canvas.style.position = "absolute"
		this.gl.canvas.style.top = 0
		this.gl.canvas.style.left = 0
		this.gl.canvas.style.zIndex = 0

		this.parentDom.appendChild(this.gl.canvas)

		this.camera = new Camera(this.gl, { near: 0.1, far: 10001, left: -this.canvasW / 2, right: this.canvasW / 2, bottom: -this.canvasH / 2, top: this.canvasH / 2, zoom: 1 })
		this.camera.position.z = 8000

		this.isRenderTarget = false

		this.scene = new Transform()
	}

	_getParentRect(dom) {
		const parent = dom
		const w = parent.getBoundingClientRect().width
		const h = parent.getBoundingClientRect().height
		return { w, h }
	}

	colors(colors_list) {
		// isInit 代表首次创建颜色 palette 数据
		// 如果不是首次，则 _resetColors 更新数据
		// 如果传入的颜色数目少于该BG要求的颜色数，则循环填充
		// 如果传入的颜色数目多于该BG要求的颜色数，则切掉多出

		let isUpdate = this.palette.length ? true : false

		this.palette = []

		if (colors_list.length == 0) {
			this.palette = ["#F00911", "#F3AA00", "#F6EE0B", "#39E90D", "#195ED2", "#F00911"]
		} else {
			if (colors_list.length < this.colors_num) {
				let temp_palette = [...colors_list]
				for (let last = temp_palette.length; last < 6; last++) {
					let pointer = last % temp_palette.length

					colors_list.push(temp_palette[pointer])
				}
				this.palette = colors_list
			} else {
				for (let i = 0; i < this.colors_num; i++) {
					this.palette.push(colors_list[i])
				}
			}
		}

		if (isUpdate) {
			this._resetColors()
		}
	}

	start() {
		this._size()
		this._initRtt()
		this._resetSeed()
		this._makeMaterial()
		this._make()

		requestAnimationFrame(this._update)
	}

	resize() {
		const wh = this._getParentRect(this.parentDom)
		this.canvasW = wh.w
		this.canvasH = wh.h
		this.renderer.setSize(this.canvasW, this.canvasH)
		this.camera.orthographic({ near: 0.1, far: 10001, left: -this.canvasW / 2, right: this.canvasW / 2, bottom: -this.canvasH / 2, top: this.canvasH / 2, zoom: 1 })
		this._size()
		this.reset()
	}

	reset(seed) {
		
		this.rng = seed ? new Math.seedrandom(seed) : new Math.seedrandom(this.seed)

		this._delete()
		this._resetSeed()
		this._make()
	}

	_update = () => {
		requestAnimationFrame(this._update)

		if (this.loop) {
			this.frame++
			this._animate()
		}

		this.gl.clearColor(0.0, 0.0, 0.0, 1)
		this.renderer.render({ scene: this.scene, camera: this.camera })

		if (this.isRenderTarget) {
			this.gl.clearColor(0.0, 0.0, 0.0, 1)
			this.renderer.render({ scene: this.rttPlane, camera: this.rttCamera, target: this.rtt })
		}
	}

	_delete() {
		for (let i = this.scene.children.length - 1; i >= 0; i--) {
			this.scene.removeChild(this.scene.children[i])
		}
	}

	_size() {}
	_initRtt() {}
	_resetSeed() {}
	_animate() {}

	destroy() {
		this._delete()
		this.parentDom.removeChild(this.gl.canvas)
	}
}
