'use client'

import { useEffect, useRef } from 'react'
import {
	AbstractShapeBg,
	AestheticFluidBg,
	AmbientLightBg,
	BigBlobBg,
	BlurDotBg,
	BlurGradientBg,
	ChaosWavesBg,
	CurveGradientBg,
	GridArrayBg,
	RandomCubesBg,
	StepGradientBg,
	SwirlingCurvesBg,
	TrianglesMosaicBg,
	WavyWavesBg
} from 'color4bg'

// 背景类型到背景类的映射表
const BG_CLASS_MAP = {
	'abstract-shape': AbstractShapeBg,
	'aesthetic-fluid': AestheticFluidBg,
	'ambient-light': AmbientLightBg,
	'big-blob': BigBlobBg,
	'blur-dot': BlurDotBg,
	'blur-gradient': BlurGradientBg,
	'chaos-waves': ChaosWavesBg,
	'curve-gradient': CurveGradientBg,
	'grid-array': GridArrayBg,
	'random-cubes': RandomCubesBg,
	'step-gradient': StepGradientBg,
	'swirling-curves': SwirlingCurvesBg,
	'triangles-mosaic': TrianglesMosaicBg,
	'wavy-waves': WavyWavesBg
}

/**
 * Color4Bg Next.js 组件
 * 
 * @param {Object} props
 * @param {string} props.style - 背景类型（必需），如 "abstract-shape"
 * @param {string[]} [props.colors] - 颜色数组，最多6个十六进制颜色值
 * @param {number} [props.seed] - 随机种子，用于生成一致的图案
 * @param {boolean} [props.loop] - 是否循环动画
 * @param {Object} [props.options] - 背景特定选项对象
 */
export function Color4Bg({ style, colors, seed, loop, options }) {
	const containerRef = useRef(null)
	const bgInstanceRef = useRef(null)

	useEffect(() => {
		// 确保在客户端环境下运行
		if (typeof window === 'undefined' || typeof document === 'undefined') {
			return
		}

		// 验证 style prop
		if (!style) {
			console.warn('Color4Bg: style prop is required')
			return
		}

		// 获取背景类
		const BgClass = BG_CLASS_MAP[style]
		if (!BgClass) {
			console.warn(`Color4Bg: Unknown style "${style}". Available styles: ${Object.keys(BG_CLASS_MAP).join(', ')}`)
			return
		}

		// 确保容器 DOM 已挂载
		if (!containerRef.current) {
			return
		}

		// 获取父容器（组件的父元素）
		const parentDom = containerRef.current.parentElement
		if (!parentDom) {
			console.warn('Color4Bg: Parent element not found')
			return
		}

		// 确保父容器有相对定位
		const parentDomStyle = window.getComputedStyle(parentDom)
		if (parentDomStyle.position === 'static') {
			parentDom.style.position = 'relative'
		}

		// 为父容器生成唯一 ID（如果还没有）
		let containerId = parentDom.id
		if (!containerId) {
			containerId = `color4bg-container-${Math.random().toString(36).substr(2, 9)}`
			parentDom.id = containerId
		}

		// 构建初始化参数
		const params = {
			dom: containerId, // 传递容器 ID
			colors: colors || [],
			seed: seed !== undefined ? seed : 1000,
			loop: loop !== undefined ? loop : false,
			options: options || {}
		}

		// 创建背景实例
		try {
			bgInstanceRef.current = new BgClass(params)
			// 注意：BgClass 构造函数中已经调用了 start()，所以不需要手动调用
		} catch (error) {
			console.error('Color4Bg: Failed to create background instance', error)
		}

		// 清理函数
		return () => {
			if (bgInstanceRef.current && typeof bgInstanceRef.current.destroy === 'function') {
				try {
					bgInstanceRef.current.destroy()
				} catch (error) {
					console.error('Color4Bg: Error during cleanup', error)
				}
				bgInstanceRef.current = null
			}
		}
	}, [style]) // 只在 style 变化时重新创建实例

	// 处理 colors 变化（仅在实例存在且 colors 变化时更新）
	useEffect(() => {
		if (typeof window === 'undefined') return
		if (!bgInstanceRef.current) return
		
		if (colors && Array.isArray(colors) && colors.length > 0) {
			try {
				if (typeof bgInstanceRef.current.colors === 'function') {
					bgInstanceRef.current.colors(colors)
				}
			} catch (error) {
				console.error('Color4Bg: Failed to update colors', error)
			}
		}
	}, [colors])

	// 处理 seed 变化（仅在实例存在且 seed 变化时更新）
	useEffect(() => {
		if (typeof window === 'undefined') return
		if (!bgInstanceRef.current) return
		
		if (seed !== undefined && seed !== null) {
			try {
				if (typeof bgInstanceRef.current.reset === 'function') {
					bgInstanceRef.current.reset(seed)
				}
			} catch (error) {
				console.error('Color4Bg: Failed to update seed', error)
			}
		}
	}, [seed])

	// 处理 loop 变化（仅在实例存在且 loop 变化时更新）
	useEffect(() => {
		if (typeof window === 'undefined') return
		if (!bgInstanceRef.current) return
		
		if (loop !== undefined) {
			try {
				bgInstanceRef.current.loop = loop
			} catch (error) {
				console.error('Color4Bg: Failed to update loop', error)
			}
		}
	}, [loop])

	// 处理 options 变化（仅在实例存在且 options 变化时更新）
	useEffect(() => {
		if (typeof window === 'undefined') return
		if (!bgInstanceRef.current) return
		
		if (options && typeof options === 'object') {
			try {
				// 遍历 options 对象，调用 update 方法
				if (typeof bgInstanceRef.current.update === 'function') {
					Object.entries(options).forEach(([key, value]) => {
						bgInstanceRef.current.update(key, value)
					})
				}
			} catch (error) {
				console.error('Color4Bg: Failed to update options', error)
			}
		}
	}, [options])

	// 返回一个空的 div 作为占位符，用于获取父容器引用
	// 这个组件本身不渲染任何内容，背景会挂载到父容器中
	return <div ref={containerRef} style={{ display: 'none' }} />
}

export default Color4Bg
