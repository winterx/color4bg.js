export class UI {
	constructor(Colors, Bgs, Options, colorbg, palette) {
		listColorBgs(Bgs)
		listPalettes(Colors, colorbg, palette)
		listOptions(colorbg, Options)
	}
}

function listPalettes(Colors, colorbg, palette) {
	for (const paletteKey in Colors) {
		let _colors = Colors[paletteKey]

		let colorrow = document.createElement("li")
		colorrow.setAttribute("class", "color-row m-2 p-3 min-w-40 flex justify-evenly hover:bg-white/50 rounded-lg cursor-pointer")
		colorrow.addEventListener("click", () => [changePalette(_colors)])

		_colors.forEach((hex, i) => {
			let c = document.createElement("DIV")
			c.setAttribute("class", "color w-5 h-5 rounded-lg")
			c.setAttribute("style", "background:" + hex)
			colorrow.appendChild(c)
		})

		colors_list.appendChild(colorrow)
	}

	function changePalette(colors) {
		document.querySelector("#box_colors").classList.remove("show")
		palette = [...colors]
		colorbg.colors(palette)
	}
}

function listOptions(bg, options) {
	let optionsbox = document.querySelector("#options_list")

	let optionsObj = options[bg.name]

	optionsObj.forEach((obj) => {
		switch (obj.type) {
			case "range":
				let slider_label = document.createElement("div")
				slider_label.setAttribute("class", "slider-label my-1 mr-6 w-24 text-sm text-right")
				slider_label.innerText = obj.display

				let slider_num = document.createElement("div")
				slider_num.setAttribute("class", "slider-num ml-4")
				slider_num.setAttribute("id", obj.name + "_value")
				slider_num.innerText = obj.value

				let slider = document.createElement("input")
				slider.type = "range"
				slider.min = obj.min
				slider.max = obj.max
				slider.step = obj.step
				slider.value = obj.value
				slider.setAttribute("class", "slider-range w-40")
				slider.addEventListener("input", function () {
					bg.update(obj.name, this.value)
					slider_num.innerText = this.value
				})

				let row = document.createElement("div")
				row.setAttribute("class", "flex")

				row.appendChild(slider_label)
				row.appendChild(slider)
				row.appendChild(slider_num)

				optionsbox.appendChild(row)
				break

			case "text":
				let textlabel = document.createElement("div")
				textlabel.setAttribute("class", "slider-label my-1 mr-6 w-24 text-sm text-right")
				textlabel.innerText = obj.display

				let textinput = document.createElement("input")
				textinput.type = "text"
				textinput.value = 1000
				textinput.addEventListener("input", function () {
					bg.reset( parseFloat(this.value) )
					console.log(bg.seed);
				})

				let textrow = document.createElement("div")
				textrow.setAttribute("class", "flex")
				textrow.appendChild(textlabel)
				textrow.appendChild(textinput)

				optionsbox.appendChild(textrow)
				break
		}
	})

	initUIEvents()
}

function listColorBgs(ColorBgs) {
	const $list = document.querySelector("#bg_list")

	ColorBgs.forEach((item, index) => {
		let imgnode = document.createElement("IMG")
		imgnode.src = `./assets/images/${item.name}.jpg`
		imgnode.setAttribute("class", "rounded-lg hover:opacity-85 cursor-pointer")

		let titlenode = document.createElement("DIV")
		titlenode.setAttribute("class", "mt-1 text-sm text-gray-500")
		titlenode.textContent = item.name

		let link = document.createElement("A")
		link.setAttribute("data-bg", item.name)
		link.setAttribute("class", "bg-item block mb-2")
		link.setAttribute("href", `./demo-module-js.html?bg=${item.name}`)
		link.appendChild(imgnode)
		link.appendChild(titlenode)

		$list.appendChild(link)
	})
}

function initUIEvents() {
	document.querySelector("#btn_show_colors").addEventListener("mouseenter", () => {
		let colorsdom = document.querySelector(".colors-list-box")
		colorsdom.style.display = "block"
		setTimeout(() => {
			colorsdom.classList.add("show")
		}, 200)
	})

	document.querySelector("#box_colors").addEventListener("mouseleave", () => {
		let colorsdom = document.querySelector(".colors-list-box")
		colorsdom.style.display = "none"
		setTimeout(() => {
			colorsdom.classList.remove("show")
		}, 200)
	})

	document.querySelector("#btn_show_options").addEventListener("mouseenter", () => {
		let colorsdom = document.querySelector(".options-list-box")
		colorsdom.style.display = "block"
		setTimeout(() => {
			colorsdom.classList.add("show")
		}, 200)
	})

	document.querySelector("#box_options").addEventListener("mouseleave", () => {
		let colorsdom = document.querySelector(".options-list-box")
		colorsdom.style.display = "none"
		setTimeout(() => {
			colorsdom.classList.remove("show")
		}, 200)
	})
}

export function getBgTypeFromUrl(Bgs) {
	const queryParams = new URLSearchParams(window.location.search)
	for (const [key, value] of queryParams.entries()) {
		switch (key) {
			case "bg":
				let Bg = Bgs.find(function (item) {
					return item.name === value
				})

				const colorbg = new Bg.class({
					dom: "box", // DOM that you want to add color background
					colors: ["#F00911", "#F3AA00", "#F6EE0B", "#39E90D", "#195ED2", "#F00911"], // 6 Hex colors
					seed: 1000, // Random seed
					loop: true // Whether the background would be loop animated
				})

				return colorbg
		}
	}

	return false
}
