var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var wiredep = require('wiredep').stream;
var _ = require('lodash');
var exec = require('child_process').exec;
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'del']
});
var browserSync = require('browser-sync');

gulp.task('inject', function(){
  var srcjsInjectFile = gulp.src([
    path.join(conf.paths.src, 'ng-spnavigation.js'),
    path.join(conf.paths.src, '**/*.js'), 
    '!./src/**/*.build.js',
    '!./src/**/*.spec.js'
    ], { read: false });
  var srcjsInjectOptions = {
    starttag: '<!-- inject:srcjs -->',
    addPrefix: conf.paths.spAssetsUrl+'/'+conf.paths.app,
    addRootSlash: false,
    transform: function (filepath, file, i, length) {
      return "<script type=\"text/javascript\" src=\""+filepath+"\"></script>"
    }
  };

  var cssInjectFiles = gulp.src([
    path.join(conf.paths.tmp, '**/*.css')
  ], { read: false });

  var cssInjectOptions = {
    addPrefix: conf.paths.spAssetsUrl+'/'+conf.paths.app,
    ignorePath: [conf.paths.tmp],
    addRootSlash: false
  }

  gulp.src('demo/demo.ps1')
    .pipe($.replace("$pageName = 'app'", "$pageName = '"+conf.paths.app+"'"))
    .pipe($.replace("$spHost = ''", "$spHost = '"+conf.paths.spHost+"'"))
    .pipe($.replace("$spWebServerRelativeUrl = ''", "$spWebServerRelativeUrl = '"+conf.paths.spSandboxUrl+"'"))
    .pipe(gulp.dest(conf.paths.tmp))

  gulp.src('demo/demo.xml')
    .pipe($.replace("//localhost/browser-sync/", "//"+conf.paths.browserSyncIp+"/browser-sync/"))
    .pipe($.inject(srcjsInjectFile, srcjsInjectOptions))
    .pipe($.inject(cssInjectFiles, cssInjectOptions))
    .pipe(wiredep(_.extend({}, conf.wiredep)))
    .pipe(gulp.dest(conf.paths.tmp))
})

gulp.task('run-demo-ps1', ['inject'], function (callback) {
    exec("Powershell.exe  -executionpolicy remotesigned . .\\.tmp\\demo.ps1" , function(err, stdout, stderr){
       console.log(stdout);
       browserSync.reload();
       callback(err)
    });
});