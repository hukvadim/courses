var gulp         = require('gulp'),
	autoprefixer = require('gulp-autoprefixer'),
	concat       = require('gulp-concat'),
	cleanCSS     = require('gulp-clean-css'),
	sourcemaps   = require('gulp-sourcemaps'),
	rename       = require('gulp-rename'),
	uglify       = require('gulp-uglify'),
	sass         = require('gulp-sass'),
	fileinclude  = require('gulp-file-include'),
	browserSync  = require('browser-sync').create(),
	del          = require('del'),
	runSequence  = require('run-sequence'),
	reload       = browserSync.reload;


var base = {
	dist:  'dist/',
	src:   'src/',
	img:   'img/',
	js:    'js/',
	libs:  'libs/',
	sass:  'sass/',
	css:   'css/',
	fonts: 'fonts/',

	fileSass:    'base.sass',
	fileJs:      'scripts.js',
	fileJsMin:   'scripts.min.js',
	fileCssMin:  'style.min.css',
};


var dist = {
		fonts: base.dist + base.fonts,
		img:   base.dist + base.img,
		js:    base.dist + base.js,
		css:   base.dist + base.css,
		libs:  base.dist + base.libs,
		pages: base.dist,
	},
	src = {
		fonts: base.src + base.fonts,
		img:   base.src + base.img,
		js:    base.src + base.js,
		libs:  base.src + base.libs,
		sass:  base.src + base.sass,
	},
	watch = {
		fonts: base.src + base.fonts + '**/*.*',
		img:   base.src + base.img + '**/*.*',
		js:    base.src + base.js + '*.js',
		libs:  base.src + base.libs + '**/*.*',
		sass:  base.src + base.sass + '*.sass',
		htmlFiles: base.src + '*.html',
		htmlPages: base.src + 'page--*.html',
	};



// Видалення dist зі всім його вмістимим
gulp.task('clean', function(cb) {
	return del([base.dist + '*']);
});



// Оброблюємо помилки
var error = function (e) {
	console.log('--------------------------------------');
	console.error('* ' + e.message);

	if (typeof e.cause != 'undefined') {
		console.error('- ' + e.cause.filename + ', line '  + e.cause.line);
	}

	console.log('--------------------------------------');
};



// Мінімізуміємо js
gulp.task('minJs', function () {
	return gulp.src(watch.js)
		.pipe(uglify().on('error', error))
		.pipe(concat(base.fileJsMin))
		.pipe(gulp.dest(dist.js));
});


// Формуємо з частини html один файл розділу
gulp.task('html', function () {
	return gulp.src(watch.htmlPages)
		.pipe(fileinclude({
			prefix: '@@',
			basepath: '@file'
		})).on('error', error)
		.pipe(rename(function (path) {
			path.basename = path.basename.split('page--').join('');
			path.extname = ".html";
		})).on('error', error)
		.pipe(gulp.dest(dist.pages));
});


// Sass в css
gulp.task('sass', function() {
	return gulp.src(src.sass + base.fileSass)
		.pipe(sourcemaps.init())
		.pipe(sass())
		.on('error', sass.logError)
		.pipe(cleanCSS({compatibility: 'ie9'}))
		.pipe(autoprefixer({cascade: false}))
		.pipe(rename(base.fileCssMin))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(dist.css));
});


// Картинки просто копіюємо
gulp.task('img', function() {
	return gulp.src(watch.img)
		.pipe(gulp.dest(dist.img));
});


// Шрифти просто копіюємо
gulp.task('fonts', function() {
	return gulp.src(watch.fonts)
		.pipe(gulp.dest(dist.fonts));
});


// Бібліотеки просто копіюємо
gulp.task('libs', function() {
	return gulp.src(watch.libs)
		.pipe(gulp.dest(dist.libs));
});


// Створюємо сервер і відслідковуємо файли
gulp.task('webserver', function() {
	browserSync.init({
		server: {
			baseDir: "./dist"
		},
		tunnel: true,
		host: 'localhost', 
		port: 9000,
		logPrefix: "2u4u"
	});
});



// Збираємо проект
gulp.task('build', function(cb) {
    runSequence(
		'clean',
		'fonts',
		'img',
		'libs',
		'minJs',
		'sass',
		'html',
		cb
	)
});



// Стандартний варіант компіляції файлів
gulp.task('watch', function() {
	gulp.watch(watch.htmlFiles, ['html']).on('change', browserSync.reload);
	gulp.watch(watch.htmlPages, ['html']).on('change', browserSync.reload);
	gulp.watch(watch.fonts, ['fonts']).on('change', browserSync.reload);
	gulp.watch(watch.img, ['img']).on('change', browserSync.reload);
	gulp.watch(watch.libs, ['libs']).on('change', browserSync.reload);
	gulp.watch(watch.js, ['minJs']).on('change', browserSync.reload);
	gulp.watch(watch.sass, ['sass']).on('change', browserSync.reload);
});


// За замовчуванням: відслідковуємо
// gulp.task('default', ['watch']);
gulp.task('default', ['build', 'webserver', 'watch']);