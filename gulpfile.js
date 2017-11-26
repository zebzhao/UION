var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var less = require('gulp-less');
var cleanCSS = require('gulp-clean-css');
var template = require('gulp-dot-template');

var files = [
  'bower_components/uikit/js/uikit.js',
  'bower_components/uikit/js/components/autocomplete.js',
  'bower_components/uikit/js/components/form-password.js',
  'bower_components/uikit/js/components/notify.js',
  'bower_components/uikit/js/components/search.js',
  'bower_components/uikit/js/components/upload.js',
  'uion.js'];

gulp.task('build', function () {
  return gulp.src(files)
    .pipe(template({debug: false}, {varname: 'env', conditional: /\[\[\?(\?)?\s*([\s\S]*?)\s*\]\]/g}))
    .pipe(concat('uion.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('.'));

});

gulp.task('build-debug', function () {
  return gulp.src(files)
    .pipe(template({debug: true}, {varname: 'env', conditional: /\[\[\?(\?)?\s*([\s\S]*?)\s*\]\]/g}))
    .pipe(concat('uion.debug.js'))
    .pipe(gulp.dest('.'))
    .pipe(gulp.dest('./docs'));
});

gulp.task('build-less', function () {
  return gulp.src(['less/**/uikit.less'])
    .pipe(less())
    .pipe(cleanCSS())
    .pipe(gulp.dest('css'))
    .pipe(gulp.dest('docs/css'));
});

gulp.task('default', ['build', 'build-debug', 'build-less']);
