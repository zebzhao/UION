var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');


gulp.task('build-pykit', function() {
    return gulp.src(['pykit.js'])
        .pipe(concat('pykit.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('.'));
});

gulp.task('build-less', function () {
    return gulp.src(['less/*.less'])
        .pipe(less())
        .pipe(minifyCSS({"source-map": 1}))
        .pipe(gulp.dest('css'));
});

gulp.task('default', ['build-pykit', 'build-less']);
