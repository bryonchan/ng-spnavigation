var gulp = require('gulp');
var conf = require('./conf');
var path = require('path');
var wiredep = require('wiredep').stream;
var _ = require('lodash');
var mainBowerFiles = require('main-bower-files');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'del']
});

gulp.task('deploy-src', ['deploy-styles'], function(){
    return gulp.src(['./src/**/*.js','./src/**/*.html'])
    .pipe(gulp.dest(path.join(conf.paths.spMappedDrive, conf.paths.app, conf.paths.src)));
});

gulp.task('deploy-build', ['build', 'deploy-styles'], function(){
    return gulp.src([path.join(conf.paths.dist, './**/*.js')])
    .pipe(gulp.dest(path.join(conf.paths.spMappedDrive, conf.paths.app))); 
});

gulp.task('deploy-styles', ['styles'], function(){
    return gulp.src([path.join(conf.paths.tmp, '/*.css')])
	.pipe(gulp.dest(path.join(conf.paths.spMappedDrive, conf.paths.app)));
});

gulp.task('deploy-js', function(event){
	return gulp.src(event.path)
		.pipe(gulp.dest(path.join(conf.paths.spMappedDrive, conf.paths.app, conf.path.src)));
});

gulp.task('deploy-bower-files', function(){
  return gulp.src(mainBowerFiles(), {base: conf.paths.bower})
    .pipe(gulp.dest(path.join(conf.paths.spMappedDrive, conf.paths.app, conf.paths.bower)));
});

gulp.task('deploy', ['deploy-src', 'deploy-build', 'deploy-bower-files', 'inject', 'run-demo-ps1'], function(){
});

