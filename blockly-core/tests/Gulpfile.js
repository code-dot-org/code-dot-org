var gulp = require('gulp');
var closureCompiler = require('gulp-closure-compiler');
var glob = require('glob');
var del = require('del');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');

var browserify = require('./lib/frontend/browserify');

gulp.task('compile', function () {
  return gulp.src('testRunner.js')
    .pipe(closureCompiler({
      compilerPath: '../compiler.jar',
      
});

gulp.task('default', function () {
  
});

