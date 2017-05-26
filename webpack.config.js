const path = require('path');
module.exports = {
	entry: './index.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js',
		pathinfo: true,
	},
	module: {
		rules: [
			{
				test: /.js$/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['env'],
					},
				},
				exclude: /node_modules/,
			},
		],
	},
};
