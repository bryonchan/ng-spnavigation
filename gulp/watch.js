
var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var browserSync = require('browser-sync');

function isOnlyChange(event) {
  return event.type === 'changed';
}

gulp.task('watch', function () {
    
    gulp.watch([
        path.join(conf.paths.src, '/**/*.css'),
        path.join(conf.paths.src, '/**/*.scss'),
        path.join('!'+conf.paths.src, '/bootstrap-build.scss')
      ], function(event) {

        if(isOnlyChange(event)) {
          gulp.start('styles');
        } else {
          //gulp.start('inject-reload');
        }
      });

    gulp.watch([
        path.join(conf.paths.src, '/bootstrap-build.scss')
      ], function(event) {

        if(isOnlyChange(event)) {
          gulp.start('bootstrap-styles');
        } else {
          //gulp.start('inject-reload');
        }
      });

    gulp.watch([
        path.join(conf.paths.tmp, '/**/*.css')
      ], function(event) {
        gulp.src(event.path)
            .pipe(gulp.dest(path.join(conf.paths.spMappedDrive, conf.paths.app)))
            .pipe(browserSync.stream());

      });

    gulp.watch(['src/**/*.js'], function(event){
    	gulp.src(event.path)
    		.pipe(gulp.dest(path.join(conf.paths.spMappedDrive, 'ng-spnavigation', conf.paths.src)))
    		.pipe(browserSync.stream());
      gulp.start('test');
    });

    gulp.watch(['src/**/*.html'], function(event){
    	gulp.src(event.path, {base: path.join(conf.paths.src)})
    		.pipe(gulp.dest(path.join(conf.paths.spMappedDrive, 'ng-spnavigation', conf.paths.src)))
    		.pipe(browserSync.stream());
    });

    gulp.watch('demo/demo.*', function(event){
      console.log('INFO: '+ event.path +' changed')
      gulp.start('inject')
    });

    gulp.watch('.tmp/demo.*', function(event){
      console.log('INFO: demo files updated')
      gulp.start('run-demo-ps1')
    });
});

