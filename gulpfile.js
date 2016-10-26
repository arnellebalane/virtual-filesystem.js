var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

gulp.task('jshint', function() {
    gulp.src(['gulpfile.js', 'assets/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'));
});

gulp.task('default', ['jshint']);
