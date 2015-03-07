'use strict';

var gulp = require('gulp'),
    rename = require('gulp-rename');

var DEV_ROOT = 'build/dev';


gulp.task('html:dev', function () {
    return gulp.src('src/dev.html')
          .pipe(rename('index.html'))
          .pipe(gulp.dest(DEV_ROOT));
});
