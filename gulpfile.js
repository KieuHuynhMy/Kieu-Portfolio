"use strict";

// Load plugins
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const gulp = require("gulp");
const merge = require("merge-stream");
const plumber = require("gulp-plumber");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./"
    },
    port: 3000
  });
  done();
}

// BrowserSync reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean vendor
function clean() {
  return del(["./vendor/"]);
}

// Bring third party dependencies from node_modules into vendor directory
function modules() {
  // Bootstrap
  var bootstrap = gulp
    .src("./node_modules/bootstrap/dist/**/*")
    .pipe(gulp.dest("./vendor/bootstrap"));
  // Font Awesome CSS
  var fontAwesomeCSS = gulp
    .src("./node_modules/@fortawesome/fontawesome-free/css/**/*")
    .pipe(gulp.dest("./vendor/fontawesome-free/css"));
  // Font Awesome Webfonts
  var fontAwesomeWebfonts = gulp
    .src("./node_modules/@fortawesome/fontawesome-free/webfonts/**/*")
    .pipe(gulp.dest("./vendor/fontawesome-free/webfonts"));

  // jQuery
  var jquery = gulp
    .src([
      "./node_modules/jquery/dist/*",
      "!./node_modules/jquery/dist/core.js"
    ])
    .pipe(gulp.dest("./vendor/jquery"));
  return merge(bootstrap, fontAwesomeCSS, fontAwesomeWebfonts, jquery);
}

// CSS task
function css() {
  return gulp
    .src("./scss/**/*.scss")
    .pipe(plumber())
    .pipe(
      sass({
        outputStyle: "expanded",
        includePaths: "./node_modules"
      })
    )
    .on("error", sass.logError)
    .pipe(
      autoprefixer({
        browsers: ["last 2 versions"],
        cascade: false
      })
    )
    .pipe(gulp.dest("./css"))
    .pipe(cleanCSS())
    .pipe(gulp.dest("./css"))
    .pipe(browsersync.stream());
}

// JS task
function js() {
  return gulp
    .src([
      "./js/*.js",
      "!./js/*.min.js",
      "!./js/contact_me.js",
      "!./js/jqBootstrapValidation.js"
    ])
    .pipe(uglify())
    .pipe(gulp.dest("./js"))
    .pipe(browsersync.stream());
}

// Watch files
function watchFiles() {
  gulp.watch("./scss/**/*", css);
  gulp.watch(["./js/**/*", "!./js/**/*.min.js"], js);
  gulp.watch("./**/*.html", browserSyncReload);
}

// Define complex tasks
const vendor = gulp.series(clean, modules);
const build = gulp.series(vendor, gulp.parallel(css, js));
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));

// Export tasks
exports.css = css;
exports.js = js;
exports.clean = clean;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.default = build;
