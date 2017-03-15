/**
 *  This file contains the variables used in other gulp files
 *  which defines tasks
 *  By design, we only put there very generic config values
 *  which are used in several places to keep good readability
 *  of the tasks
 */

var gutil = require('gulp-util');

/**
 *  The main paths of your project handle these with care
 */
exports.paths = {
  src: 'src',
  dist: 'dist',
  tmp: '.tmp',
  e2e: 'e2e',
  libs: 'libs',
  bower: 'bower_components',
  spSandboxUrl: '/sandbox',
  app: 'ng-spnavigation',
  spHost: '*',
  spAssetsUrl: '*',
  spMappedDrive: 'U:',
  browserSyncIp: '*'
};

/**
 *  Wiredep is the lib which inject bower dependencies in your project
 *  Mainly used to inject script tags in the index.html but also used
 *  to inject css preprocessor deps and js files in karma
 */
exports.wiredep = {
  exclude: [/jquery/, /\/bootstrap\.js$/, /\/bootstrap-sass\/.*\.js/, /\/bootstrap\.css/, /angular/],
  directory: 'bower_components',
  fileTypes: {
    master: {
      block: /(([ \t]*)<!--\s*bower:*(\S*)\s*-->)(\n|\r|.)*?(<!--\s*endbower\s*-->)/gi,
      detect: {
        js: /<script.*src=['"]([^'"]+)/gi,
        css: /<link.*href=['"]([^'"]+)/gi
      }, 
      replace: {
        js: function(filePath){
          filePath = filePath.replace('..', '');
          filePath = exports.paths.spAssetsUrl+'/'+ exports.paths.app + filePath
          return "<script type=\"text/javascript\" src=\"" + filePath + "\"></script>"  
        } 
        
      }
    }
  }
};
/**
 *  Common implementation for an error handler of a Gulp plugin
 */
exports.errorHandler = function(title) {
  'use strict';

  return function(err) {
    gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
    this.emit('end');
  };
};
