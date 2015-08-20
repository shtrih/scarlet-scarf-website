var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var gutil = require('gulp-util');
var plugins = require('gulp-load-plugins')(); // Load all gulp plugins
                                              // automatically and attach
                                              // them to the `plugins` object

var runSequence = require('run-sequence');    // Temporary solution until gulp 4
                                              // https://github.com/gulpjs/gulp/issues/355

var pkg = require('./package.json');
var dirs = pkg['h5bp-configs'].directories;

var browserify = require('browserify');
var plumber = require('gulp-plumber');
var plumberOnError = function(err) {
    gutil.log(err.message);
    this.emit('end');
};
var logMsg = function(event) {
    gutil.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
};
var sourcemaps = require('gulp-sourcemaps');
var sourceStream = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');

var tinypng = require('gulp-tinypng');
var imagemin = require('gulp-imagemin');

var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('archive:create_archive_dir', function () {
    fs.mkdirSync(path.resolve(dirs.archive), '0755');
});

gulp.task('archive:zip', function (done) {

    var archiveName = path.resolve(dirs.archive, pkg.name + '_v' + pkg.version + '.zip');
    var archiver = require('archiver')('zip');
    var files = require('glob').sync('**/*.*', {
        'cwd': dirs.dist,
        'dot': true // include hidden files
    });
    var output = fs.createWriteStream(archiveName);

    archiver.on('error', function (error) {
        done();
        throw error;
    });

    output.on('close', done);

    files.forEach(function (file) {

        var filePath = path.resolve(dirs.dist, file);

        // `archiver.bulk` does not maintain the file
        // permissions, so we need to add files individually
        archiver.append(fs.createReadStream(filePath), {
            'name': file,
            'mode': fs.statSync(filePath)
        });

    });

    archiver.pipe(output);
    archiver.finalize();

});

gulp.task('clean', function (done) {
    require('del')([
        dirs.archive,
        dirs.dist + '/*',
        dirs.dist + '/.*',
        // не удаляем картинки, ибо они пережимаются задачей tinypng вручную (ибо у них лимит пережатий в 500 картинок,
        // да и операция долгая)
        '!' + dirs.dist + '/img{,/**}'
    ], done);
});

gulp.task('copy', [
    'copy:.htaccess',
    'copy:index.html',
//    'copy:jquery',
//    'copy:other-vendors',
//    'copy:main.css',
//    'copy:normalize',
    'copy:misc'
]);

gulp.task('copy:.htaccess', function () {
    return gulp.src('node_modules/apache-server-configs/dist/.htaccess')
               .pipe(plugins.replace(/# ErrorDocument/g, 'ErrorDocument'))
               .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:index.html', function () {
    return gulp.src(dirs.src + '/index.html')
               .pipe(plugins.replace(/{{BUILD_TIMESTAMP}}/g, Date.now()))
               .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:jquery', function () {
    return gulp.src(['node_modules/jquery/dist/jquery.min.js'])
               .pipe(plugins.rename('jquery-' + pkg.devDependencies.jquery + '.min.js'))
               .pipe(gulp.dest(dirs.dist + '/js/vendor'));
});

gulp.task('copy:other-vendors', function () {
    return gulp.src([
            'node_modules/jquery.easing/jquery.easing.1.3.min.js',
            'node_modules/jquery.scrollto/jquery.scrollTo.min.js',
            'node_modules/jquery.localscroll/jquery.localScroll.min.js',
            'node_modules/jquery.stellar/jquery.stellar.js'
        ])
        .pipe(gulp.dest(dirs.dist + '/js/vendor'))
    ;
});

gulp.task('copy:main.css', function () {

    var banner = '/*! HTML5 Boilerplate v' + pkg.version +
                    ' | ' + pkg.license.type + ' License' +
                    ' | ' + pkg.homepage + ' */\n\n';

    return gulp.src(dirs.src + '/css/main.css')
               .pipe(plugins.header(banner))
               .pipe(gulp.dest(dirs.dist + '/css'));

});

gulp.task('copy:misc', function () {
    return gulp.src([

        // Copy all files
        dirs.src + '/**/*',

        // Exclude the following files
        // (other tasks will handle the copying of these files)
        '!' + dirs.src + '/css/main.css',
        '!' + dirs.src + '/css/app.css',
        '!' + dirs.src + '/index.html',
        // images task handle images copying
        '!' + dirs.src + '/img/**',
        // browserify handle these files
        '!' + dirs.src + '/js/*.js',
        '!' + dirs.src + '/doc/**'

    ], {

        // Include hidden files by default
        dot: true

    }).pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:normalize', function () {
    return gulp.src('node_modules/normalize.css/normalize.css')
               .pipe(gulp.dest(dirs.dist + '/css'));
});

gulp.task('lint:js', function () {
    return gulp.src([
            'gulpfile.js',
            dirs.src + '/js/*.js',
            dirs.test + '/*.js'
        ])
        .pipe(plumber({ errorHandler: plumberOnError }))
        .pipe(plugins.jscs())
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'))
        .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('browserify', function () {
    return browserify({ debug: true })
        .add('./' + dirs.src + '/js/app.js')
        .bundle()
        // log errors if they happen
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(sourceStream('app.min.js'))
        .pipe(buffer()) // <----- convert from streaming to buffered vinyl file object
        .pipe(sourcemaps.init({ loadMaps: true }))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(dirs.dist + '/js/'));
});

gulp.task('watch', function() {
    gulp
        .watch(dirs.src + '/index.html', ['copy:index.html'])
        .on('change', logMsg)
    ;
    gulp
        .watch(dirs.src + '/css/*.css', ['minify-css', 'copy:index.html'])
        .on('change', logMsg)
    ;
    gulp
        .watch(dirs.src + '/js/**/*.js', ['lint:js', 'browserify', 'copy:index.html'])
        .on('change', logMsg)
    ;
});

gulp.task('images', function() {
    return gulp.src([
            dirs.src + '/img/**',
            '!' + dirs.src + '/img/**/*.xcf'
        ])
        .pipe(imagemin())
        .pipe(gulp.dest(dirs.dist + '/img'));
});

gulp.task('tinypng', function() {
    return gulp.src([
            dirs.src + '/img/**',
            '!' + dirs.src + '/img/**/*.xcf',
            '!' + dirs.src + '/img/**/*.psd'
        ])
        .pipe(tinypng('hXWmLf6S3OrKy75Iz5toUuzdVCWvY__x'))
        .pipe(gulp.dest(dirs.dist + '/img'));
});


gulp.task('minify-css', function () {
    gulp.src(dirs.src + '/css/app.css')
        .pipe(plumber({ errorHandler: plumberOnError }))
        .pipe(plugins.rename('app.min.css'))
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: ['last 4 versions'],
            cascade: false
        }))
        .pipe(minifyCSS())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(dirs.dist + '/css'));
});

// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('archive', function (done) {
    runSequence(
        'build',
        'archive:create_archive_dir',
        'archive:zip',
    done);
});

gulp.task('build', function (done) {
    runSequence(
        ['clean', 'lint:js'],
        'browserify',
        'copy',
        // не копируем картинки, ибо они пережимаются задачей tinypng вручную
        // 'images',
        'minify-css',
    done);
});

gulp.task('default', ['build', 'watch']);
