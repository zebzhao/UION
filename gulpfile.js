var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');

var files = [
    'bower_components/uikit/js/uikit.js',
    'bower_components/uikit/js/core/core.js',
    'bower_components/uikit/js/core/touch.js',
    'bower_components/uikit/js/core/utility.js',
    'bower_components/uikit/js/core/smooth-scroll.js',
    'bower_components/uikit/js/core/scrollspy.js',
    'bower_components/uikit/js/core/toggle.js',
    'bower_components/uikit/js/core/alert.js',
    'bower_components/uikit/js/core/button.js',
    'bower_components/uikit/js/core/dropdown.js',
    'bower_components/uikit/js/core/grid.js',
    'bower_components/uikit/js/core/modal.js',
    'bower_components/uikit/js/core/nav.js',
    'bower_components/uikit/js/core/offcanvas.js',
    'bower_components/uikit/js/core/switcher.js',
    'bower_components/uikit/js/core/tab.js',
    'bower_components/uikit/js/core/cover.js',
    'bower_components/uikit/js/components/autocomplete.js',
    'bower_components/uikit/js/components/form-password.js',
    'bower_components/uikit/js/components/notify.js',
    'bower_components/uikit/js/components/search.js',
    'bower_components/uikit/js/components/upload.js',
    'uion.js'];

gulp.task('build', function() {
    return gulp.src(files)
        .pipe(concat('uion.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('.'));
});

gulp.task('build-debug', function() {
    return gulp.src(files)
        .pipe(concat('uion.debug.js'))
        .pipe(gulp.dest('.'));
});

gulp.task('build-less', function () {
    return gulp.src(['less/**/uikit.less', '!less/uikit/uikit.less'])
        .pipe(less())
        .pipe(minifyCSS({"source-map": 1}))
        .pipe(gulp.dest('css'));
});

gulp.task('default', ['build', 'build-debug', 'build-less']);
