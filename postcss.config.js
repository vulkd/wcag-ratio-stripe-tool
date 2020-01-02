const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const purgecss = require("@fullhuman/postcss-purgecss");

const ENABLE_PURGECSS = process.env.NODE_ENV !== "development";

module.exports = () => {
	return {
		plugins: [
			tailwindcss("./tailwind.config.js"),
			// ENABLE_PURGECSS && purgecss({
			// 	content: [
			// 		"./src/**/*.html",
			// 		"./src/**/*.vue",
			// 		"./src/**/*.css",
			// 		"./src/*.html",
			// 		"./src/*.css"
			// 	]
			// }),
			autoprefixer({
				add: true,
				grid: true
			})
		]
	};
};
