'use strict';

const gulp      = require('gulp');
const concat    = require('gulp-concat');
const sass      = require('gulp-sass');

// process.env['USE_CONNECT'] = true;

gulp.task('default', function () {
    gulp.watch(['./app/frontend/assets/styles/sass/**'], ['css']);
});


gulp.task('css', function(){
    console.log('CSS task running.');

    gulp.src(['./app/frontend/assets/styles/sass/**/*.scss'])
        // .pipe(minifyCSS())
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('style.css'))
        // .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9'))
        .pipe(gulp.dest('./app/frontend/assets/styles'))
});
