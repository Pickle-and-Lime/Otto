var gulp = require('gulp'),
  install = require("gulp-install"),
  ngAnnotate = require('gulp-ng-annotate'),
  jshint = require('gulp-jshint'),
  del = require('del'),
  sourcemaps = require('gulp-sourcemaps'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  cssmin = require('gulp-cssmin'),
  htmlreplace = require('gulp-html-replace'),
  autoprefixer = require('gulp-autoprefixer'),
  minifyHTML = require('gulp-minify-html'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  exec = require('child_process').exec,
  nodemon = require('gulp-nodemon'),
  open = require('gulp-open');

//Common paths
var paths = {
  scripts: ['./client/app/**/*.js','./server/**/*.js', './index.js','./spec/**/*.js'],
  styles: ['./client/assets/**/*.css'],
  index: './client/app/index.html',
  partials: ['client/app/**/*.html', '!client/app/index.html'],
  images: ['client/assets/**/*.png', 'client/assets/**/*.jpg', 'client/assets/**/*.jpeg', 'client/assets/**/*.gif', 'client/assets/**/*.svg', 'client/**/*.ico'],
  backendTests: ['specs/server/**/*.js']
};

//Set up function to allow running scripts
function runCommand(command) {
  return function (cb) {
    exec(command, function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  };
}


//Start mongodb
gulp.task('mongo', runCommand('mongod'));

//Start nodemon
gulp.task('nodemon', function () {
  nodemon({ script: 'index.js' })
    .on('restart', function () {
      console.log('restarted!');
    });
});

//Set environment variables for production or development
gulp.task('set-dev-node-env', function() {
    process.env.NODE_ENV = 'development';
});

gulp.task('set-prod-node-env', function() {
    process.env.NODE_ENV = 'production';
});

// JSHint task
gulp.task('lint', function() {
  gulp.src(paths.scripts)
  .pipe(jshint())
  .pipe(jshint.reporter('default'));
});

// Clean task — cleans the contents of the public folder
gulp.task('clean', function (callback) {
  del([
    'public/**/*'
  ], callback);
  
});

//Concatentate and minify js files
gulp.task('js', function () {
  gulp.src(['client/app/app.js', 'client/**/*.js', '!client/lib/**/*.js'])
    .pipe(concat('app.min.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/'));
});

// Update index.html to use built js and css files; minify html files
gulp.task('html', function() {
  gulp.src(paths.index)
  .pipe(htmlreplace({
      'css': 'assets/styles.min.css',
      'js': 'app.min.js'
  }))
  .pipe(minifyHTML())
  .pipe(gulp.dest('public/'));

  gulp.src(paths.partials)
  .pipe(minifyHTML())
  .pipe(gulp.dest('public/'));
});

// Images task — copy all images to public folder and minify
gulp.task('images', function() {
  // Image files from app/assets
  gulp.src(paths.images)
  .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
  }))
  // will be put in the public/images folder
  .pipe(gulp.dest('public/assets/'));
});

// Copy and minify css files from the client folder to public/assets folder)

gulp.task('styles', function() {
  gulp.src(paths.styles)
  .pipe(autoprefixer("last 2 versions", "> 1%", "ie 8"))
  .pipe(cssmin())
  .pipe(concat('styles.min.css'))
  // Optionally add autoprefixer
  .pipe(gulp.dest('public/assets/'));
});

//Generate documentation
gulp.task('documentation', runCommand('npm install -g yuidocjs \n yuidoc .'));

//Watch tasks
gulp.task('watch', ['lint'], function() {
  // When script files change — run lint
  gulp.watch([paths.scripts],['lint']);

});

//Open the correct url for the develpment environment
gulp.task('open-dev', function(){
  setTimeout(function(){
    gulp.src(__filename)
    .pipe(open({uri: 'http://localhost:1337/app/#/'}));
  }, 1500);
});

//Open the correct url for production environment
gulp.task('open-prod', function(){
  setTimeout(function(){
    gulp.src(__filename)
    .pipe(open({uri: 'http://localhost:1337/#/'}));
  }, 1500);
});
//Run production tasks
gulp.task('production', ['clean','lint', 'js', 'html', 'styles', 'images'], function(){
  open({uri: 'http://localhost:1337/#/'});
});

//Run development environment
gulp.task('development', ['set-dev-node-env','mongo','nodemon','watch', 'open-dev'],function(){
});

//Preview development code
gulp.task('pre-prod', ['set-prod-node-env', 'production', 'mongo','nodemon', 'watch', 'open-prod']);


//Install dependencies and documentation
gulp.task('default', ['documentation'],function() {
  runCommand('npm install -g nodemon');
  gulp.src(['./bower.json', './package.json'])
  .pipe(install());
});

//To use angularTemplates/Template caching
// gulp.task('build:templates', function() {
//   return gulp.src('client/app/**/*.html')
//     .pipe(angularTemplates({module: 'GroceriesApp', basePath: 'app/'}))
//     .pipe(concat('app.templates.min.js'))
//     .pipe(uglify({mangle: false}))
//     .pipe(gulp.dest('public/'));
// });

//Add testing tasks still