'use strict';

var gulp = require('gulp'),
    rename = require('gulp-rename'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload;

var DEV_ROOT = 'build/dev';

var src = {
    js:   'src/scripts/**/*.js',
    html: 'src/*.html'
};

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

    gulp.watch(src.html, ['html:dev']);
});
