var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');

var files = [
    'bower_components/uikit/src/js/uikit.js',
    'bower_components/uikit/src/js/core/core.js',
    'bower_components/uikit/src/js/core/touch.js',
    'bower_components/uikit/src/js/core/utility.js',
    'bower_components/uikit/src/js/core/smooth-scroll.js',
    'bower_components/uikit/src/js/core/scrollspy.js',
    'bower_components/uikit/src/js/core/toggle.js',
    'bower_components/uikit/src/js/core/alert.js',
    'bower_components/uikit/src/js/core/button.js',
    'bower_components/uikit/src/js/core/dropdown.js',
    'bower_components/uikit/src/js/core/grid.js',
    'bower_components/uikit/src/js/core/modal.js',
    'bower_components/uikit/src/js/core/nav.js',
    'bower_components/uikit/src/js/core/offcanvas.js',
    'bower_components/uikit/src/js/core/switcher.js',
    'bower_components/uikit/src/js/core/tab.js',
    'bower_components/uikit/src/js/core/cover.js',
    'bower_components/uikit/src/js/components/autocomplete.js',
    'bower_components/uikit/src/js/components/form-password.js',
    'bower_components/uikit/src/js/components/notify.js',
    'bower_components/uikit/src/js/components/search.js',
    'bower_components/uikit/src/js/components/upload.js',
    'jikit.js'];

gulp.task('build-jikit', function() {
    return gulp.src(files)
        .pipe(concat('jikit.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('.'));
});

gulp.task('build-debug-jikit', function() {
    return gulp.src(files)
        .pipe(concat('jikit.debug.js'))
        .pipe(gulp.dest('.'));
});

gulp.task('build-less', function () {
    return gulp.src(['less/**/uikit.less', '!less/uikit/uikit.less'])
        .pipe(less())
        .pipe(minifyCSS({"source-map": 1}))
        .pipe(gulp.dest('css'));
});

gulp.task('default', ['build-jikit', 'build-debug-jikit', 'build-less']);
