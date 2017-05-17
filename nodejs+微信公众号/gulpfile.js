/**
 *   gulp
 */

/*!
 * gulp 的使用
 * $ npm install gulp-less gulp-autoprefixer gulp-minify-css gulp-jshint gulp-concat gulp-uglify gulp-imagemin
  * gulp-notify gulp-rename gulp-livereload gulp-cache del --save-dev
 *
 * http://markpop.github.io/2014/09/17/Gulp%E5%85%A5%E9%97%A8%E6%95%99%E7%A8%8B/
 */
//导入工具包 require('node_modules里对应模块')
var gulp = require('gulp'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    del = require('del');

// Styles 编译less、自动添加css前缀和压缩
gulp.task('styles', function() {
    return gulp.src('./public/less/**/*.less')
        .pipe(less())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest('./public/dist/css'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(minifycss())
        .pipe(gulp.dest('./public/dist/css'))
        .pipe(notify({ message: 'Styles task complete' }));
});
// Scripts  js代码校验、合并和压缩
gulp.task('scripts', function() {
    return gulp.src('./public/scripts/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        // .pipe(concat('main.js'))
        .pipe(gulp.dest('./public/dist/js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest('./public/dist/js'))
        .pipe(notify({ message: 'Scripts task complete' }));
});
// Images  压缩图片
gulp.task('images', function() {
    return gulp.src('./public/images/**/*')
        .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
        .pipe(gulp.dest('./public/dist/images'))
        .pipe(notify({ message: 'Images task complete' }));
});
// Clean 清除文件
gulp.task('clean', function(cb) {
    del(['./public/dist/assets/css', './public/dist/assets/js', './public/dist/assets/img'], cb)
});
// Default task  设置默认任务（default）
gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'scripts', 'images');
});
// Watch
gulp.task('watch', function() {
    // Watch .less files
    gulp.watch('./public/less/**/*', ['styles']);
    // Watch .js files
    gulp.watch('./public/scripts/**/*.js', ['scripts']);
    // Watch image files
    gulp.watch('./public/images/**/*', ['images']);
    // Create LiveReload server
    livereload.listen();  //当文件修改时自动刷新页面
    // Watch any files in dist/, reload on change
    gulp.watch(['./public/dist/**']).on('change', livereload.changed);
});