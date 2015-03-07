'use strict';

var gulp = require('gulp'),
    hint = require('gulp-jshint'),
    stylish = require('jshint-stylish');

require('./gulpfile.dev');

gulp.task('hint', function () {
    return gulp.src([
        'src/scripts/**/*.js'
    ]).pipe(hint('.jshintrc'))
        .pipe(hint.reporter(stylish))
        .pipe(hint.reporter('fail'));
});
