'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');

gulp.task('copy-html', function () {
	gulp
		.src(['node_modules/vss-web-extension-sdk/lib/VSS.SDK.min.js', 'node_modules/vss-web-extension-sdk/lib/VSS.SDK.js', 'node_modules/jquery/dist/jquery.min.js'])
		.pipe(gulp.dest('dist/lib'));

	gulp
		.src(['src/images/VSO-16x.png', 'src/images/VSO-196x.png', 'src/images/VSO-wide.png', 'src/images/files.png', 'src/images/templates.png'])
		.pipe(gulp.dest('dist/images'));

	return gulp
		.src(['src/html/dialog.html', 'src/html/main.html', 'src/html/hub.html'])
		.pipe(gulp.dest('dist/'));
});

gulp.task('default', ['build']);
gulp.task('build', ['copy-html', 'webpack:build']);
gulp.task('webpack:build', function (callback) {
	// modify some webpack config options
	var myConfig = Object.create(webpackConfig);
	myConfig.plugins = myConfig.plugins || [];
	myConfig.plugins = myConfig.plugins.concat(new webpack.DefinePlugin({
			'process.env': {
				// This has effect on the react lib size
				'NODE_ENV': JSON.stringify('production')
			}
		}),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin()
	);

	// run webpack
	webpack(myConfig, function (err, stats) {
		if (err) throw new gutil.PluginError('webpack:build', err);
		gutil.log('[webpack:build]', stats.toString({
			colors: true
		}));
		callback();
	});
});