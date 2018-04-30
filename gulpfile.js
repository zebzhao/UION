var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var less = require('gulp-less');
var cleanCSS = require('gulp-clean-css');

var files = [
  'bower_components/uikit/js/uikit.js',
  'bower_components/uikit/js/components/autocomplete.js',
  'bower_components/uikit/js/components/notify.js',
  'bower_components/uikit/js/components/sticky.js',
  'lumi.js'];

gulp.task('build', function () {
  return gulp.src(files)
    .pipe(concat('lumi.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('.'));
});

gulp.task('build-debug', function () {
  return gulp.src(files.concat('lumi.meta.js'))
    .pipe(concat('lumi.debug.js'))
    .pipe(gulp.dest('.'))
    .pipe(gulp.dest('./docs'));
});

gulp.task('build-less', function () {
  return gulp.src(['less/lumi/lumi.less', 'less/lumi/lumi-icons.less'])
    .pipe(less())
    .pipe(cleanCSS())
    .pipe(gulp.dest('css'))
    .pipe(gulp.dest('docs/css'));
});

gulp.task('default', ['build', 'build-debug', 'build-less']);
