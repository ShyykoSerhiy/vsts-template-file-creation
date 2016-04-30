var path = require("path");
module.exports = {
	entry: './src/main.js',
	output: {
		path: path.join(__dirname, "dist"),
		publicPath: "dist/"
	},
	cssnext: {
		browsers: "last 2 versions"
	},
	resolve: {
		// Add `.ts` and `.tsx` as a resolvable extension.
		extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
	},
	module: {
		loaders: [
			// all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
			{test: /\.tsx?$/, loader: 'babel-loader!ts-loader'},
		]
	},
	externals: {
		'TFS/VersionControl/Contracts': 'TFS/VersionControl/Contracts',
		'TFS/VersionControl/GitRestClient': 'TFS/VersionControl/GitRestClient',
		'TFS/VersionControl/TfvcRestClient': 'TFS/VersionControl/TfvcRestClient'
	}
};