var gulp = require('gulp');
var browserSync = require('browser-sync');
var wrench = require('wrench');
var path = require('path');
var conf = require('./gulp/conf');

/**
 *  This will load all js or coffee files in the gulp directory
 *  in order to load all gulp tasks
 */
wrench.readdirSyncRecursive('./gulp').filter(function(file) {
  return (/\.(js|coffee)$/i).test(file);
}).map(function(file) {
  require('./gulp/' + file);
});


gulp.task('serve', ['watch'], function() {
    browserSync.instance = browserSync.init({
        server: {
            baseDir: "./",
            https: true
        },
        socket: {
        	domain: conf.paths.browserSyncIp
        },
        open: false
    });
});

gulp.task('default', ['build']);

