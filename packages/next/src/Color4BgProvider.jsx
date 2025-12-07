'use client'

import { Color4Bg } from './Color4Bg.jsx'

/**
 * Color4BgProvider Next.js 组件
 * 
 * 允许在服务端组件中使用彩色背景，无需在页面组件上添加 'use client' 指令
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - 子组件内容
 * @param {string} props.style - 背景类型（必需），如 "abstract-shape"
 * @param {string[]} [props.colors] - 颜色数组，最多6个十六进制颜色值
 * @param {number} [props.seed] - 随机种子，用于生成一致的图案
 * @param {boolean} [props.loop] - 是否循环动画
 * @param {Object} [props.options] - 背景特定选项对象
 * @param {string} [props.className] - 容器的自定义 className
 * @param {Object} [props.containerStyle] - 容器的自定义 style 对象
 */
export function Color4BgProvider({ 
	children, 
	style: bgStyle, 
	colors, 
	seed, 
	loop, 
	options,
	className,
	containerStyle
}) {
	// 合并容器样式
	const mergedContainerStyle = {
		width: '100%',
		height: '100%',
		position: 'relative',
		...containerStyle
	}

	return (
		<div className={className} style={mergedContainerStyle}>
			<Color4Bg 
				style={bgStyle}
				colors={colors}
				seed={seed}
				loop={loop}
				options={options}
			/>
			{children}
		</div>
	)
}

export default Color4BgProvider

