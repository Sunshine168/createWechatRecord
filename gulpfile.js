var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var watchify = require("watchify");
var buffer = require('vinyl-buffer');
var gutil = require("gulp-util");
var ts = require("gulp-typescript");
var babel = require('gulp-babel');
var paths = {
	pages: ['src/html/*.html'],
};
var tsProject = ts.createProject("tsconfig.json");
var watchPath = require('gulp-watch-path')
gulp.task("copy-html", function() {
	return gulp.src(paths.pages)
		.pipe(gulp.dest("dist/html"));
});

gulp.task("build", ["copy-html"], function() {
	return browserify({
			basedir: '.',
			debug: true,
			entries: ['src/main.ts'],
			cache: {},
			packageCache: {}
		})
		.plugin(tsify)
		.bundle()
		.transform('babelify', {
			presets: ['es2015'],
			extensions: ['.ts']
		})
		.pipe(source('bundle.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({
			loadMaps: true
		}))
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest("dist/js"));
});
var watchedBrowserify = watchify(browserify({
	basedir: '.',
	debug: true,
	entries: ['src/main.ts'],
	cache: {},
	packageCache: {}
}).plugin(tsify));

function bundle() {
	return watchedBrowserify
		.bundle()
		.pipe(source('bundle.js'))
		.pipe(gulp.dest("dist"));
}

// gulp.task("default", ["copy-html"], bundle);
// watchedBrowserify.on("update", bundle);
// watchedBrowserify.on("log", gutil.log);

gulp.task("complier", ["copy-html", 'watchjs', 'watchHtml'], function() {
	return tsProject.src()
		.pipe(tsProject())
		.pipe(babel())
		.pipe(gulp.dest("dist/js"));
});

gulp.task('watchHtml', function() {
	gulp.watch('src/html/*.html', function(event) {
		var paths = watchPath(event, 'src/html/', 'dist/html/')
			/*
			paths
			    { srcPath: 'src/js/log.js',
			      srcDir: 'src/js/',
			      distPath: 'dist/js/log.js',
			      distDir: 'dist/js/',
			      srcFilename: 'log.js',
			      distFilename: 'log.js' }
			*/
		gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
		gutil.log('Dist ' + paths.distPath)
		gulp.src(paths.srcPath)
			.pipe(gulp.dest(paths.distDir))
	})
})
gulp.task('watchjs', function() {
	gulp.watch('src/*.ts', function(event) {
		var paths = watchPath(event, 'src/', 'dist/js/')
			/*
			paths
			    { srcPath: 'src/js/log.js',
			      srcDir: 'src/js/',
			      distPath: 'dist/js/log.js',
			      distDir: 'dist/js/',
			      srcFilename: 'log.js',
			      distFilename: 'log.js' }
			*/
		gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
		gutil.log('Dist ' + paths.distPath)
		gulp.src(paths.srcPath)
			.pipe(tsProject())
			.pipe(babel())
			.pipe(gulp.dest(paths.distDir))
	})
})

gulp.task('test', ['copy-html'], function() {
	return browserify({
			basedir: '.',
			debug: true,
			entries: ['src/index.ts'],
			cache: {},
			packageCache: {}
		})
		.plugin(tsify)
	// .transform('babelify', {
	// 	presets: ['es2015'],
	// 	extensions: ['.ts']
	// })
		.bundle()
		.pipe(source('bundle.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({
			loadMaps: true
		}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('dist'));
});

gulp.task("autoComplier", ["watchjs"]);