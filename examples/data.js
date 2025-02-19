import { AbstractShapeBg } from "../build/jsm/AbstractShapeBg.module.js"
import { AestheticFluidBg } from "../build/jsm/AestheticFluidBg.module.js"
import { BigBlobBg } from "../build/jsm/BigBlobBg.module.js"
import { BlurDotBg } from "../build/jsm/BlurDotBg.module.js"
import { BlurGradientBg } from "../build/jsm/BlurGradientBg.module.js"
import { ChaosWavesBg } from "../build/jsm/ChaosWavesBg.module.js"
import { CurveGradientBg } from "../build/jsm/CurveGradientBg.module.js"
import { AmbientLightBg } from "../build/jsm/AmbientLightBg.module.js"
import { RandomCubesBg } from "../build/jsm/RandomCubesBg.module.js"
import { TrianglesMosaicBg } from "../build/jsm/TrianglesMosaicBg.module.js"
import { WavyWavesBg } from "../build/jsm/WavyWavesBg.module.js"
import { GridArrayBg } from "../build/jsm/GridArrayBg.module.js"
import { StepGradientBg } from "../src/color4bg/AbstractBackground/StepGradientBg.js"

const Colors = {
	pastel: ["#D1ADFF", "#98D69B", "#FAE390", "#FFACD8", "#7DD5FF", "#D1ADFF"], // pastel
	pastelglossy: ["#FE8BFC", "#BD9FFB", "#8EDBFD", "#C4F5EF", "#E7F9FE", "#E9FFE0"], // glossy pastel
	vivid: ["#F00911", "#F3AA00", "#F6EE0B", "#39E90D", "#195ED2", "#F00911"], // vivid
	blue: ["#007FFE", "#3099FE", "#60B2FE", "#90CCFE", "#C0E5FE", "#F0FFFE"], // gradient blue
	black: ["#000000", "#3F3F3F", "#7F7F7F", "#DADADA", "#EAEAEA", "#F3F3F3"],
	blackVivid: ["#000000", "#F00911", "#F3AA00", "#F6EE0B", "#39E90D", "#195ED2"]
}

const Bgs = [
	{
		name: "abstract-shape",
		class: AbstractShapeBg,
		palette: "blue"
	},
	{
		name: "aesthetic-fluid",
		class: AestheticFluidBg,
		palette: "vivid"
	},
	{
		name: "ambient-light",
		class: AmbientLightBg,
		palette: "vivid"
	},
	{
		name: "big-blob",
		class: BigBlobBg,
		palette: "pastel"
	},
	{
		name: "blur-dot",
		class: BlurDotBg,
		palette: "pastelglossy"
	},
	{
		name: "blur-gradient",
		class: BlurGradientBg,
		palette: "pastelglossy"
	},
	{
		name: "chaos-waves",
		class: ChaosWavesBg,
		palette: "pastel"
	},
	{
		name: "curve-gradient",
		class: CurveGradientBg,
		palette: "pastelglossy"
	},
	{
		name: "grid-array",
		class: GridArrayBg,
		palette: "blue"
	},
	{
		name: "random-cubes",
		class: RandomCubesBg,
		palette: "pastelglossy"
	},
	{
		name: "triangles-mosaic",
		class: TrianglesMosaicBg,
		palette: "pastel"
	},
	{
		name: "wavy-waves",
		class: WavyWavesBg,
		palette: "pastelglossy"
	}
]

const Options = {
	"abstract-shape": [
		{
			type: "range",
			name: "noise",
			display: "scale",
			min: 0.0,
			max: 0.5,
			step: 0.01,
			value: 0.1
		},
		{
			type: "range",
			name: "wavy",
			display: "scale",
			min: 0,
			max: 20,
			step: 1,
			value: 10
		}
	],
	"aesthetic-fluid": [
		{
			type: "range",
			name: "scale",
			display: "Scale",
			min: 0.01,
			max: 0.3,
			step: 0.01,
			value: 0.15
		}
	],
	"ambient-light": [
		{
			type: "range",
			name: "speed",
			display: "Speed",
			min: 1,
			max: 10,
			step: 1,
			value: 1
		},
		{
			type: "range",
			name: "pattern scale",
			display: "Scale",
			min: 0,
			max: 1,
			step: 0.05,
			value: 1
		},
		{
			type: "range",
			name: "edge blur",
			display: "Blur",
			min: 0,
			max: 1,
			step: 0.01,
			value: 0
		},
		{
			type: "range",
			name: "brightness",
			display: "Shape",
			min: 0,
			max: 1.2,
			step: 0.01,
			value: 0.2
		},
		{
			type: "range",
			name: "darkness",
			display: "Background",
			min: 0,
			max: 1,
			step: 0.01,
			value: 0
		}
	],
	"big-blob": [],
	"blur-dot": [],
	"blur-gradient": [
		{
			type: "range",
			name: "noise",
			display: "Noise",
			min: 0.0,
			max: 0.5,
			step: 0.01,
			value: 0.1
		}
	],
	"chaos-waves": [
		{
			type: "range",
			name: "noise",
			display: "Noise",
			min: 0.0,
			max: 0.5,
			step: 0.01,
			value: 0.1
		},
		{
			type: "range",
			name: "speed",
			display: "Speed",
			min: 1,
			max: 20,
			step: 1,
			value: 1
		}
	],
	"curve-gradient": [
		{
			type: "range",
			name: "noise",
			display: "Noise",
			min: 0.0,
			max: 0.5,
			step: 0.01,
			value: 0.1
		},
		{
			type: "range",
			name: "speed",
			display: "Speed",
			min: 1,
			max: 20,
			step: 1,
			value: 1
		},
		{
			type: "range",
			name: "scale",
			display: "Scale",
			min: 0.01,
			max: 4,
			step: 0.01,
			value: 1
		},
	],
	"grid-array": [
		{
			type: "range",
			name: "scale",
			display: "Scale",
			min: 1,
			max: 200,
			step: 1,
			value: 100
		},
		{
			type: "range",
			name: "u_w",
			display: "Width",
			min: 0.1,
			max: 0.99,
			step: 0.01,
			value: 0.8
		},
		{
			type: "range",
			name: "u_h",
			display: "Height",
			min: 0.1,
			max: 0.99,
			step: 0.01,
			value: 0.8
		},
		{
			type: "range",
			name: "amplitude",
			display: "Amplitude",
			min: 0.0,
			max: 5.0,
			step: 0.01,
			value: 0.5
		},
		{
			type: "range",
			name: "radius",
			display: "Radius",
			min: 0.0,
			max: 1,
			step: 0.01,
			value: 0.1
		},
		{
			type: "range",
			name: "borderwidth",
			display: "BorderWidth",
			min: 0.01,
			max: 0.1,
			step: 0.01,
			value: 0.01
		},
		{
			type: "range",
			name: "rotateCanvas",
			display: "Rotate Canvas",
			min: 0,
			max: 360,
			step: 1,
			value: 0
		},
		{
			type: "range",
			name: "rotateUnit",
			display: "Rotate Unit",
			min: 0,
			max: 360,
			step: 1,
			value: 0
		},
		{
			type: "text",
			name: "seed",
			display: "Seed",
			value: 1000
		},
		{
			type: "range",
			name: "speed",
			display: "Speed",
			min: 1,
			max: 10,
			step: 1,
			value: 5
		}
	],
	"random-cubes": [],
	"swirling-curves": [
		{
			type: "range",
			name: "noise",
			display: "Noise",
			min: 0.0,
			max: 0.5,
			step: 0.01,
			value: 0.1
		},
		{
			type: "range",
			name: "speed",
			display: "Speed",
			min: 0.1,
			max: 5,
			step: 0.01,
			value: 0.1
		},
		{
			type: "range",
			name: "density",
			display: "Density",
			min: 100,
			max: 2000,
			step: 100,
			value: 1500
		},
		{
			type: "range",
			name: "scale",
			display: "Scale",
			min: 0.1,
			max: 50,
			step: 0.1,
			value: 8.0
		}
	],
	"triangles-mosaic": [
		{
			type: "range",
			name: "noise",
			display: "Noise",
			min: 0.0,
			max: 0.5,
			step: 0.01,
			value: 0.1
		},
		{
			type: "range",
			name: "speed",
			display: "Speed",
			min: 1,
			max: 10,
			step: 1,
			value: 10
		}
	],
	"wavy-waves": []
}

export { Colors, Options, Bgs }
