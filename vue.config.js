module.exports = {
	devServer: {
		host: "localhost"
	},
	transpileDependencies: [
		/\bvue-awesome\b/u
	],
	configureWebpack: {
		devtool: "source-map",
		watchOptions: {
			ignored: /node_modules/u
		}
	}
};
