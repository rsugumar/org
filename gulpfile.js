'use strict';

var gulp = require('gulp')
  , browserSync = require('browser-sync')
  , gp_nodemon = require('gulp-nodemon')
  , gp_concat = require('gulp-concat')
  , gp_rename = require('gulp-rename')
  , gp_uglify = require('gulp-uglify')
  , nodeInspector = require('gulp-node-inspector');


gulp.task('default', ['browser-sync','debug'], function ( ) {
});

gulp.task('debug', function() {  
  gulp.src([])
    .pipe(nodeInspector({
      webPort: '8080',
      preload: false
    }));
});

gulp.task('browser-sync', ['gp_nodemon'], function() {
	browserSync.init(null, {
		injectChanges: true,
		index: "http://localhost:3000",
		proxy: "http://localhost:3000",
		files: [
		"public/**/*.*",
		"views/*.jade",
		"*.js",
		"classes/*",
		"cache/*",
		"routes/*"
		],
		browser: "google-chrome",
		port: 7000,
	});
});

gulp.task('gp_nodemon', function (cb) {
	
	var started = false;
	
	return gp_nodemon({
		exec: 'node --debug',
		script: 'app.js'
	}).on('start', function () {
		// to avoid gp_nodemon being started multiple times
		if (!started) {
			cb();
			started = true; 
		} 
	});
});

gulp.task('ugly', function ( ) {
    return gulp.src([
    	'app.js',
    	'config.js',
    	'server.js',
    	'classes/*.js',
    	'cache/*.js',
    	'models/*.js',
    	'routes/*.js'
    	])
        .pipe(gp_concat('concat.js'))
        .pipe(gulp.dest('dist'))
        .pipe(gp_rename('uglify.js'))
        .pipe(gp_uglify())
        .pipe(gulp.dest('dist'));
});