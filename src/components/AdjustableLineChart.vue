<template>
	<div style="height: calc(8rem + 35px)" class="overflow-hidden">
		<div ref="adjustableLineChart" class="w-full h-32 bg-gray-100">
			<div class="w-full flex">
				<span v-for="color in colors" class="inline-block flex-1" :style="{'background-color': color.hex, 'height': '2px'}"></span>
			</div>
			<div class="border border-b-0 w-full h-8 absolute pointer-events-none" :style="{'width': width+'px'}"></div>
			<svg :id="uniqueId" :width="width" :height="height" class="border border-gray-400 overflow-visible bg-gray-100" style="margin-top:32px;"></svg>
		</div>
	</div>
</template>

<script>
import * as d3 from "d3";
import contrast from 'get-contrast';
import { hex2rgb, rgb2hex, rgb2hsl, lab2rgb, rgb2lab, getCorrectTextColor } from "@/lib/colors.js";

export default {
	props: {
		k: String,
		colors: {
			type: Array,
			required: true
		},
		selectedColor: {
			type: String,
			required: true
		},
		selectedValue: {
			type: Number,
			required: true
		}
	},
	data() {
		return {
			width: 0,
			height: 0
		}
	},
	created() {
		this.uniqueId = `${this.$vnode.tag}-${this._uid}`;
	},
	watch: {
		colors: {
			handler(val) {
				this.draw()
			},
			deep: true
		}
	},
	// computed: {
	// 	xScale() {
	// 		const data = this.colors;
	// 		const xPadding = .5;
	// 		return d3.scaleLinear()
	// 		.range([0, this.width])
	// 		.domain([-xPadding, data.length - xPadding]);
	// 	},
	// 	yScale() {
	// 		const data = this.colors;
	// 		const yPadding = 20;
	// 		return d3.scaleLinear()
	// 		.range([this.height, 0])
	// 		.domain([d3.min(data, d => d.x) - yPadding, d3.max(data, d => d.x) + yPadding]);
	// 	},
	// 	dots() {
	// 		const data = this.colors;
	// 		return data.map((d, i) => ({
	// 			id: i,
	// 			r: 10,
	// 			x: this.xScale(i),
	// 			y: this.yScale(d.x),
	// 			fill: d.hex
	// 		}));
	// 	},
	// 	path() {
	// 		const data = this.colors;
	// 		return {

	// 		}
	// 		// svg.append("path")
	// 		// .datum(data)
	// 		// .attr("stroke-width", 4)
	// 		// .attr("stroke", `url(#${this.uniqueId}-linear-gradient)`)
	// 		// .attr("fill", "none")
	// 		// .attr("d", line);
	// 	}
	// },
	mounted() {
		this.limitUpper = this.k === "h" ? 360 : 100;
		this.limitLower = 0;

		this.width = this.$refs.adjustableLineChart.offsetWidth + 1;
		this.height = this.$refs.adjustableLineChart.offsetHeight + 1;
		this.draw();
	},
	methods: {
		draw() {
			const svg = d3.select(`#${this.uniqueId}`);
			svg.selectAll("*").remove();
			svg.append("g");

			const data = this.colors;
			// const dataset = d3.range(data.length).map(d => data[d]);

			const xPadding = .5;
			const x = d3.scaleLinear()
			.range([0, this.width])
			.domain([-xPadding, data.length - xPadding]);

			const yPadding = 20;
			const y = d3.scaleLinear()
			.range([this.height, 0])
			// .domain(d3.extent(data, (d) => d.x));
			.domain([d3.min(data, d => d.x) - yPadding, d3.max(data, d => d.x) + yPadding]);

			const line = d3.line()
			.x((d, i) => x(i))
			.y((d, i) => y(d.x))
			.curve(d3.curveMonotoneX);

			const defs = svg.append("defs");

			const pattern = defs
			.append("pattern")
			.attr("id", `${this.uniqueId}-diagonal-stripes`)
			.attr("width", "3")
			.attr("height", "4")
			.attr("patternUnits", "userSpaceOnUse")
			.attr("patternTransform", "rotate(60)");

			pattern.append("rect")
			.attr("width", "1")
			.attr("height", "4")
			.attr("transform", "translate(0,0)")
			.attr("fill", "#c1ccd9");

			const linearGradient = defs.append("linearGradient")
			.attr("id", `${this.uniqueId}-linear-gradient`)
			.attr("gradientTrasform", "rotate(90)");

			for (const idx in data) {
				linearGradient.append("stop")
				.attr("offset", `${100 * idx / data.length}%`)
				.attr("stop-color", data[idx].hex);
			}

			svg.append("path")
			.datum(data)
			.attr("stroke-width", 4)
			.attr("stroke", `url(#${this.uniqueId}-linear-gradient)`)
			.attr("fill", "none")
			.attr("d", line);

			const getTickLabel = (d) => {
				return !d
				? ""
				: d.x === d.h ? (d.hslH * 360).toFixed(2)
				: d.x === d.c ? (d.hslL * 100).toFixed(2)
				: d.x.toFixed(2)
			}

			svg.append("g")
			.attr("class", "axislabels")
			.attr("style", "transform: translateY(-29px)")
			.call(d3.axisBottom(x).tickFormat(d => getTickLabel(data[d])))
			.call(g => {
				g.selectAll(".domain").remove();
				g.selectAll(".tick line").remove();
				g.selectAll(".tick").attr("class", "text-gray-600 fill-current select-none");
			});

			svg.selectAll(".text")
			.data(data)
			.enter()
			.append("text")
			.attr("x", (d, i) => x(i) + 1)
			.attr("y", (d, i) => y(d.x) - 3)
			.attr("class", d => `fill-current ${d.wcagRatio >= 4.5 ? 'text-green-500' : 'text-red-500'}`)
			.attr("style", "font-size: 0.5rem")
			.text((d) => d.wcagRatio);

			svg.selectAll(".dot")
			.data(data)
			.enter()
			.append("circle")
			.attr("class", "dot-border")
			.attr("fill", (d) => "#fff")
			.attr("stroke", (d) => "#ccc")
			.attr("cx", (d, i) => x(i))
			.attr("cy", (d, i) => y(d.x))
			.attr("r", 5);

			svg.selectAll(".dot")
			.data(data)
			.enter()
			.append("circle")
			.attr("class", "dot-main cursor-pointer")
			.attr("fill", (d) => d.hex)
			.attr("stroke", (d) => "#fff")
			.attr("cx", (d, i) => x(i))
			.attr("cy", (d, i) => y(d.x))
			.attr("r", 4)
			.on("mouseover", (d, i, a) => {
				// console.log(d,i,a)
			})
			.call(d3.drag()
				.on("start", (d, i, a) => {;
					const dot = a[i]
					d3.select(dot).attr("fill", "limegreen");
				})
				.on("drag", (d, i, a) => {
					const newY = y.invert(d3.event.y);
					const tickLabel = svg.selectAll(".axislabels text")._groups[0][i]
					tickLabel.innerHTML = getTickLabel(d);
					if (newY >= this.limitUpper || newY <= this.limitLower) return;
					const dot = a[i];
					d3.select(dot).attr("cy", y(newY));
					const dotBorder = svg.selectAll(".dot-border")._groups[0][i]
					d3.select(dotBorder).attr("cy", y(newY));
					d.x = newY;
					svg.select("path").attr("d", line);
				})
				.on("end", (d, i, a) => {
					const dot = a[i];
					d3.select(dot).attr("fill", d.hex);
					console.log(d,i,a)
					this.$emit("change", {selectedValueIdx: i, value: d.x, color: d.color})
				})
				);

			if (this.k === "l") this.drawOverlay(x, y, data, svg);
		},
		drawOverlay(x, y, data, svg) {
			const yPadding = 20;
			const iter = data.length / 2;

			// var x3 = d3.range(0, 2*3.14, 0.1);
			// var xp = d3.scaleLinear().domain([0, 2 * Math.PI]).range([0, this.width]);

			let badAreas = []
			const dots = svg.selectAll(".dot-main")._groups[0];
			for (let idx = 0; idx < dots.length; idx ++) {
				const dot = dots[idx];
				badAreas.push({min: 100, max:0});
				const cx = dot.getAttribute("cx");
				const cy = dot.getAttribute("cy");
				const fill = dot.getAttribute("fill");
				const getWcagRatio = (hex, newVal) => {
					const oldRGB = hex2rgb(hex);
					const oldLab = rgb2lab(oldRGB);
					const newCRgb = lab2rgb([//k === "l" ? newVal " oldLab[0], oldLab[1], oldLab[2]]);
						this.k === "l" ? newVal : oldLab[0],
						this.k === "c" ? newVal : oldLab[1],
						this.k === "h" ? newVal : oldLab[2]]);
					const newCLab = rgb2lab(newCRgb);
					const newCHex = rgb2hex(...newCRgb.map(x => parseInt(x)))
					return contrast.ratio(newCHex, getCorrectTextColor(newCHex)).toFixed(2);
				}
				for (let yCoord = 0; yCoord < this.limitUpper + yPadding; yCoord += iter) {
					// for (let xCoord = 0; xCoord < data.length - xPadding; xCoord++) {
					const pointCx = cx;
					const pointCy = yCoord + yPadding;
					const badRatio = getWcagRatio(fill, yCoord) < 4.5;

					// svg.append("circle").attr("cx", pointCx).attr("cy", pointCy).attr("r", 1)
					// .attr("fill", d => badRatio ? 'red' : 'transparent');

					if (badRatio) {
						badAreas[idx].min = Math.min(badAreas[idx].min, pointCy)
						// console.log(cx, 'min', badAreas[cx], Math.min(badAreas[cx].min, pointCy))
						badAreas[idx].max = Math.max(badAreas[idx].max, pointCy)
						// console.log(cx, 'mxa', badAreas[cx], Math.min(badAreas[cx].max, pointCy))
					}
					// }
				}
			}

			// lower band
			// svg.append("path")
			// .datum(data)
			// .attr("stroke-width", 1)
			// .attr("stroke", "#f0f")
			// .attr("fill", "none")
			// .attr("d", d3.line()
			// 	.x((d, i) => x(i))
			// 	.y((d, i) => {
			// 		return y(badAreas[i].min === badAreas[i].max
			// 			? badAreas[i].min - yPadding + iter/2
			// 			: badAreas[i].min - yPadding - iter/2);
			// 	})
			// 	);

			// upper band
			// svg.append("path")
			// .datum(data)
			// .attr("stroke-width", 1)
			// .attr("stroke", "#0ff")
			// .attr("fill", "none")
			// .attr("d", d3.line()
			// 	.x((d, i) => x(i))
			// 	.y((d, i) => {
			// 		return y(badAreas[i].min === badAreas[i].max
			// 			? badAreas[i].max - yPadding + iter/2
			// 			: badAreas[i].max - yPadding - iter/2);
			// 	})
			// 	);

			const area = d3.area()
			.x((d, i, a) => x(i))
			.y0((d, i, a) => {
				return y(badAreas[i].min === badAreas[i].max
					? badAreas[i].min - yPadding
					: badAreas[i].min - yPadding - iter/2);
			})
			.y1((d,i,a) => {
				return y(badAreas[i].min === badAreas[i].max
					? badAreas[i].max - yPadding + iter
					: badAreas[i].max - yPadding - iter/4);
			})
			// .y1((d,i,a) => y(5 * i))
			// .y0((d, i, a) => y2(d.wcagRatio))
			// .y1((d, i, a) => y2(d.wcagRatio))
			.curve(d3.curveCardinal)
			// .curve(d3.curveBasis)
			// .curve(d3.curveMonotoneX)

			svg.append("path")
			.datum(data)
			.attr("fill", `url(#${this.uniqueId}-diagonal-stripes)`)
			.attr("stroke", "#c1ccd9")
			.attr("opacity", 0.5)
			.attr("class", "pointer-events-none")
			.attr("d", area);
		},
		getCorrectTextColor(color) {
			return getCorrectTextColor(color) === "#ffffff" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"
		}
	}
};
</script>
