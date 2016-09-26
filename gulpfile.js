var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');

var mainBowerFiles = require('main-bower-files')().concat([]);
var bowerDir = './components';

var in_js_files = ['./js/**'];
var out_js_dir = './js/build';
var out_js_file = 'scripts.build.js';

var in_css_files = ['./css/**'];
var out_css_dir = './css/build';
var out_css_file = 'styles.build.css';

var out_fonts_dir = './css/fonts';

function js(files, destDirectory) {
    return gulp.src(files)
        .pipe(plugins.filter(['**/*.js']))
        .pipe(plugins.order([
            'jquery.js',
            'angular.js',
            '*'
        ]))
        .pipe(plugins.concat(out_js_file))
        .pipe(plugins.ngAnnotate())
        .pipe(plugins.uglify())
        .pipe(gulp.dest(destDirectory));
}

function css(files, destDirectory) {
    return gulp.src(files)
        .pipe(plugins.filter(['**/*.css', '**/*.less']))
        .pipe(plugins.order([
            'normalize.css',
            '*'
        ]))
        .pipe(plugins.less())
        .pipe(plugins.concat(out_css_file))
        // .pipe(plugins.cleanCss({keepBreaks: true}))
        .pipe(gulp.dest(destDirectory));
}

function fonts(destDirectory) {
    var files = [
        bowerDir + '/font-awesome/fonts/*'
    ];
    return gulp.src(files)
        .pipe(plugins.filter(['**/fontawesome-webfont.*']))
        .pipe(gulp.dest(destDirectory));
}

gulp.task('clean', function () {
    return del([
        out_js_dir + '/' + out_js_file,
        out_css_dir + '/' + out_css_file,
        out_fonts_dir + '/*'
    ]);
});

gulp.task('js', function () {
    js(mainBowerFiles.concat(in_js_files), out_js_dir);
});

gulp.task('css', function () {
    css(mainBowerFiles.concat(in_css_files), out_css_dir);
});

gulp.task('copy-fonts', function () {
    fonts(out_fonts_dir);
});

gulp.task('build', function () {
    return runSequence('clean', ['js', 'css', 'copy-fonts']);
});

gulp.task('default', ['build']);