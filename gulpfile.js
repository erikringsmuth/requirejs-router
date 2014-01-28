'use strict';
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('lint', function() {
  gulp.src(['router.js', 'tests/spec/*.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('minify', function() {
  gulp.src('router.js')
    .pipe(uglify())
    .pipe(rename('router.min.js'))
    .pipe(gulp.dest('.'));
});

// The default task (called when you run `gulp`)
gulp.task('default', function(){
  gulp.run('lint', 'minify');

  // Watch files and run tasks if they change
  gulp.watch('router.js', function() {
    gulp.run('lint', 'minify');
  });

  gulp.watch('tests/spec/*.js', function() {
    gulp.run('lint');
  });
});

// CI build
gulp.task('ci', function(){
  gulp.run('lint');
});