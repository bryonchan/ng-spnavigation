var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var exec = require('child_process').exec;
var browserSync = require('browser-sync');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'del']
});

gulp.task('partials', function () {
  return gulp.src([
    path.join(conf.paths.src, '/**/*.html'),
    '!'+path.join(conf.paths.src, '/**/index.html')
  ])
    .pipe($.htmlmin({
      removeEmptyAttributes: true,
      removeAttributeQuotes: true,
      collapseBooleanAttributes: true,
      collapseWhitespace: true
    }))
    .pipe($.angularTemplatecache('templateCacheHtml.js', {
      module: 'ngSpNavigation'
    }))
    .pipe(gulp.dest(conf.paths.tmp + '/templates/'));
});

gulp.task('html', ['partials', 'dist-styles'], function () {
	var partialsInjectFile = gulp.src(path.join(conf.paths.tmp, '/templates/templateCacheHtml.js'), { read: false });
	  var partialsInjectOptions = {
	    starttag: '<!-- inject:partials -->',
	    //ignorePath: path.join(conf.paths.tmp, '/templates'),
	    addPrefix: '..',
	    addRootSlash: false
	  };

	return gulp.src('src/index.html')
	.pipe($.inject(partialsInjectFile, partialsInjectOptions))
	.pipe($.useref()) //combines filesusing comments in index.html
	.pipe(gulp.dest(conf.paths.dist));
});

gulp.task('dist-styles', function(){
  gulp.src(path.join(conf.paths.src, 'ng-spnavigation.scss'))
  .pipe(gulp.dest(conf.paths.dist)); 
});

gulp.task('build', ['html']);
