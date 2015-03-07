'use strict';

var gulp = require('gulp'),
    hint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    rename = require('gulp-rename'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    browserify = require("browserify"),
    source = require("vinyl-source-stream");

var DEV_ROOT = 'build/dev';

var src = {
    js:   'src/scripts/**/*.js',
    html: 'src/*.html'
};


gulp.task('hint', function () {
    return gulp.src([
        src.js,
        "gulpfile.js"
    ]).pipe(hint('.jshintrc'))
        .pipe(hint.reporter(stylish))
        .pipe(hint.reporter('fail'));
});


gulp.task('scripts:dev', ['hint'], function () {
    return browserify({entries: ["./src/scripts/main.js"]})
        .bundle()
        .pipe(source("bundle.js"))
        .pipe(gulp.dest(DEV_ROOT))
        .pipe(reload({stream: true}));
});


gulp.task('html:dev', function () {
    return gulp.src('src/dev.html')
          .pipe(rename('index.html'))
          .pipe(gulp.dest(DEV_ROOT))
          .pipe(reload({stream: true}));
});


gulp.task('serve', function () {
    browserSync({
        server: DEV_ROOT
    });

    gulp.watch(src.js, ['scripts:dev']);
    gulp.watch(src.html, ['html:dev']);
});


