// const { execSync } = require('child_process');
import { execSync } from "child_process"

const components = [
	"aesthetic-fluid-bg",
	"abstract-shape-bg",
	"ambient-light-bg",
	"big-blob-bg",
	"blur-dot-bg",
	"blur-gradient-bg",
	"chaos-waves-bg",
	"curve-gradient-bg",
	"grid-array-bg",
	"random-cubes-bg",
	"swirling-curves-bg",
	"triangles-mosaic-bg",
	"wavy-waves-bg"
]

components.forEach((component) => {
	console.log(`Building ${component}...`)
	execSync(`COMPONENT=${component} rollup -c`, { stdio: "inherit" })
	console.log(`${component} built successfully.`)
})
