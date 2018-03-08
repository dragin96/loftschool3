'use strict'; 

const gulp = require('gulp');
const pug = require('gulp-pug');
const stylus = require('gulp-stylus');
const cssmin = require('gulp-minify-css');//минификатор цсс
const cssunit = require('gulp-css-unit');//перевод в ремы
const gcmq = require('gulp-group-css-media-queries');//сборка всех условий
const uncss  = require ('gulp-uncss');//удаление лишнего кода
const autoprefixer = require('gulp-autoprefixer');//автопрефикс
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const svgSprite = require('gulp-svg-sprites');//спрайт
const svgmin = require('gulp-svgmin');//минимизатор
const cheerio = require('gulp-cheerio');//удаление атрибутов
const replace = require('gulp-replace');//багфикс
const browserSync = require("browser-sync").create(,//сервер
	  reload = browserSync.reload;
const del = require("del");
const path = {
	build: {
		template: 'build/',
		style: 'build/css/',
		img: 'build/img/',
		fonts: 'build/fonts/',
		svg: 'build/'
	},
	src: {
		template: 'src/*.pug',
		style: 'src/style/main.styl',
		img: 'src/img/**/*.*',
		fonts: 'src/fonts/**/*.*',
		svg: 'src/svg/**/*.svg'
	},
	root: 'build'
};

var config = {
	server: {
		baseDir: path.root
	},
	tunnel: true,
	host: 'localhost',
	port: 9000,
	logPrefix: "server"
};

function template(){
    return gulp.src(path.src.template)
        .pipe(pug({pretty:true}))
        .pipe(gulp.dest(path.build.template))
}
function style(){
	return gulp.src(path.src.style)
	.pipe(stylus({
		compress: true
	}))
	.pipe(cssunit({
		type:'px-to-rem',
		rootSize: 16
	}))//перевод в ремы
	.pipe(gcmq())
/*
	.pipe(uncss({
		html: ["src/template/*.html","src/index.html"]
	}))//вкл перед прод(чистит код)
*/
	.pipe(autoprefixer({
		browsers: ['last 2 versions'],
	}))//автопрефикс
	.pipe(gulp.dest(path.build.style))
}

function img(){
	return gulp.src(path.src.img) 
	.pipe(imagemin({
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()],
		interlaced: true
	}))
	.pipe(gulp.dest(path.build.img))
}

function fonts(){
	return gulp.src(path.src.fonts)
	.pipe(gulp.dest(path.build.fonts));
}
function svg(){
	return gulp.src(path.src.svg)
	.pipe(svgmin({
		js2svg: {
			pretty: true
		}
	}))
	.pipe(cheerio({
		run: function ($) {
			$('[fill]').removeAttr('fill');
			$('[style]').removeAttr('style');
		},
		parserOptions: { xmlMode: true }
	}))
	.pipe(replace('&gt;', '>'))
	.pipe(svgSprite({
			mode: "symbols",
			preview: false,
			selector: "icon-%f",
			svg: {
				symbols: 'sprite-svg.html'
			}
		}
	))
	.pipe(gulp.dest(path.build.svg));
}
function clean(){
	return del(path.root);
}


exports.template = template;
exports.style = style;
exports.img = img;
exports.fonts = fonts;
exports.svg = svg;
exports.clean = clean;

function watch(){
	gulp.watch(path.src.style,style);
	gulp.watch(path.src.template, template);
	gulp.watch(path.src.img, img);
	gulp.watch(path.src.svg,svg);
	gulp.watch(path.src.fonts, fonts);
}

function serv(){
	browserSync(config);
	browserSync.watch(path.root+'/**/*',browserSync.reload);
}
gulp.task('default',gulp.series(
	clean,
	gulp.parallel(template,style,img,fonts,svg),
	gulp.parallel(watch,serv)
))

