import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import babel from "@rollup/plugin-babel"
import terser from "@rollup/plugin-terser"

const component = process.env.COMPONENT; // 从环境变量中获取组件名称
const name = toCamelCase(component)

export default {
	input: `./src/color4bg/AbstractBackground/${name}.js`,
	output: [
		{
			file: `./build/jsm/${name}.module.js`, // 打包后的文件位置和名称
			format: "es", // 输出格式（ES模块）
			sourcemap: false // 生成 source map
		},
		{
			file: `./build/js/${name}.min.js`,
			format: "umd",
			name: `Color4Bg`,
			sourcemap: false
		}
	],
	plugins: [
		resolve(),
		commonjs(),
		babel({
			babelHelpers: "bundled",
			exclude: "node_modules/**",
			presets: ["@babel/preset-env"]
		}),
		terser({
			format: {
				comments: false // 移除所有注释
			},
			compress: {
				drop_console: true, // 移除所有console.* 函数
				drop_debugger: true, // 移除debugger;
				booleans: true, // 优化布尔表达式
				conditionals: true, // 优化if语句
				dead_code: true, // 移除未使用的代码
				evaluate: true, // 预计算常量表达式
				sequences: true, // 将多个语句合并为一个
				unused: true, // 移除未使用的变量和函数
				if_return: true, // 优化if/return和if/continue
				join_vars: true // 加入连续的var声明
			}
			// mangle: {
			// 	toplevel: true, // 改变顶级变量和函数名
			// 	properties: {
			// 		// 压缩属性名称（慎用，可能会破坏代码接口）

			// 		// 仅压缩以下划线开头的属性名
			// 		regex: /^_/
			// 	}
			// }
		})
	]
}

function toCamelCase(str) {
    // 将字符串分割成数组，使用连字符('-')作为分割符
    const words = str.split('-');

    // 将数组中的每个元素转换，使得每个单词的首字母大写，其余字母小写
    const capitalizedWords = words.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );

    // 将处理过的单词数组重新组合成一个字符串
    return capitalizedWords.join('');
}
