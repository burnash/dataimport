'use strict';

var gulp = require('gulp'),
  hint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  rename = require('gulp-rename'),
  browserSync = require('browser-sync'),
  reload = browserSync.reload,
  concat = require('gulp-concat'),
  debug = require('gulp-debug'),
  sourcemaps = require('gulp-sourcemaps');

var DEV_ROOT = 'build/dev';

var src = {
  vendorCSS: 'vendor_modules/**/*.css',
  vendorJS: [
    'vendor_modules/jquery.min.js',
    'vendor_modules/handsontable.full.js',
    'vendor_modules/papaparse.js',
    'vendor_modules/fuse.js',
  ],
  js: [
    'src/scripts/sheet.js',
    'src/scripts/dropfile.js',
    'src/scripts/dataimport.js',
    'src/scripts/validators.js',
    'src/scripts/main.js'
  ],
  css: 'src/css/**/*.css',
  html: 'src/*.html',
};

gulp.task('hint', function () {
  return gulp.src(src.js).pipe(hint('.jshintrc'))
    .pipe(hint.reporter(stylish))
    .pipe(hint.reporter('fail'));
});

gulp.task('scripts:dev', ['hint', 'vendor:dev'], function () {
  return gulp.src(src.js)
    .pipe(debug())
    .pipe(sourcemaps.init())
    .pipe(concat('all.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(DEV_ROOT))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('vendor:dev', function () {
  return gulp.src(src.vendorJS)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(DEV_ROOT));
});

gulp.task('styles:dev', function () {
  return gulp.src([src.vendorCSS, src.css])
    .pipe(concat('all.css'))
    .pipe(gulp.dest(DEV_ROOT))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('html:dev', function () {
  return gulp.src('src/dev.html')
    .pipe(rename('index.html'))
    .pipe(gulp.dest(DEV_ROOT))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('serve', function () {
  browserSync({
    server: DEV_ROOT
  });

  gulp.watch(src.js, ['scripts:dev']);
  gulp.watch(src.css, ['styles:dev']);
  gulp.watch(src.html, ['html:dev']);
});
