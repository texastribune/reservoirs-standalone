import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';

import autoprefixer from 'autoprefixer-core';
import browserSync from 'browser-sync';
import del from 'del';
import buffer from 'vinyl-buffer';
import runSequence from 'run-sequence';
import source from 'vinyl-source-stream';
import yargs from 'yargs';

import browserify from 'browserify';
import babelify from 'babelify';
import watchify from 'watchify';

const $ = gulpLoadPlugins();
const args = yargs.argv;
const reload = browserSync.reload;
const stream = browserSync.stream;

const paths = {
  app: 'app',
  tmp: '.tmp',
  dist: 'dist',
};

function browserifyScripts(shouldWatch) {
  let bundler = browserify(`./${paths.app}/scripts/main.js`, {
    debug: true,
  });

  bundler.transform(babelify);

  function bundle() {
    return bundler.bundle()
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe($.sourcemaps.init({loadMaps: true}))
      .pipe($.if(args.production, $.uglify()))
      .pipe($.sourcemaps.write(args.production ? '.' : undefined))
      .pipe(gulp.dest(`./${paths.tmp}/scripts`))
      .pipe($.if(args.production, $.gzip({append: false})))
      .pipe($.if(args.production, gulp.dest(`./${paths.dist}/scripts`)))
      .pipe(reload({stream: true}))
      .pipe($.size({title: 'scripts'}));
  }

  if (shouldWatch) {
    bundler = watchify(bundler);
    bundler.on('update', bundle);
    bundler.on('log', $.util.log);
  }

  return bundle();
}

gulp.task('scripts', () => {
  return browserifyScripts();
});

gulp.task('watchify', () => {
  return browserifyScripts(true);
});

gulp.task('styles', () => {
  return gulp.src(`./${paths.app}/styles/*.scss`)
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: ['node_modules'],
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.postcss([
      autoprefixer()
    ]))
    .pipe($.if(args.production, $.minifyCss({
      keepSpecialComments: 0
    })))
    .pipe($.sourcemaps.write(args.production ? '.' : undefined))
    .pipe(gulp.dest(`./${paths.tmp}/styles`))
    .pipe($.if(args.production, $.gzip({append: false})))
    .pipe($.if(args.production, gulp.dest(`./${paths.dist}/styles`)))
    .pipe(stream({
      match: '**/*.css'
    }))
    .pipe($.size({title: 'styles'}));
});

gulp.task('templates', () => {
  gulp.src([`./${paths.app}/**/{*,!_*}.html`, `./!${paths.app}/**/_*.html`])
  .pipe($.if(args.production, $.minifyHtml()))
  .pipe(gulp.dest(`./${paths.dist}`))
  .pipe($.size({title: 'templates'}));
});

gulp.task('clean', cb => del([`./${paths.tmp}/**`, `./${paths.dist}/**`], cb));

gulp.task('serve', ['watchify', 'styles'], () => {
  browserSync({
    notify: false,
    logConnections: true,
    logPrefix: 'NEWSAPPS',
    open: false,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/node_modules': 'node_modules',
      }
    }
  });

  gulp.watch([`./${paths.app}/styles/**/*.scss`], ['styles']);
  gulp.watch([`./${paths.app}/**/*.html`]).on('change', reload);
});

gulp.task('serve:build', ['default'], function() {
  browserSync({
    notify: false,
    logConnections: true,
    logPrefix: 'NEWSAPPS',
    open: true,
    server: ['dist']
  });
});

gulp.task('assets', () => {
  return gulp.src([`./${paths.app}/assets/**/*`, `!./${paths.app}/assets/images/`])
  .pipe($.if('*.json', $.gzip({append: false})))
  .pipe(gulp.dest(`./${paths.dist}/assets`))
  .pipe($.size({title: 'assets'}));
});

gulp.task('rev', () => {
  return gulp.src([`./${paths.dist}/**/*.css`, `./${paths.dist}/**/*.js`])
    .pipe($.rev())
    .pipe(gulp.dest(`./${paths.dist}`))
    .pipe($.rev.manifest())
    .pipe(gulp.dest(`./${paths.dist}`));
});

gulp.task('revreplace', ['rev'], () => {
  var manifest = gulp.src(`./${paths.dist}/rev-manifest.json`);

  return gulp.src(`./${paths.dist}/index.html`)
    .pipe($.revReplace({manifest: manifest}))
    .pipe($.gzip({append: false}))
    .pipe(gulp.dest(`./${paths.dist}`));
});

gulp.task('default', ['clean'], cb => {
  runSequence(['scripts', 'styles', 'templates', 'assets'], ['revreplace'], cb);
});
