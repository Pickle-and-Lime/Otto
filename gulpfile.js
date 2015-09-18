var gulp = require('gulp'),
  runSequence = require('run-sequence'),
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
  open = require('gulp-open'),
  Server = require('karma').Server;

//Common paths
var paths = {
  scripts: ['./client/app/**/*.js','./server/**/*.js', './index.js','./spec/**/*.js'],
  clientScripts: ['./client/app/**/*.js', '!./client/app/spec/**/*.js'],
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
  return del([
    'public/**/*'
  ], callback);
  
});

//Concatentate and minify js files
gulp.task('js', function () {
  return gulp.src(paths.clientScripts)
    .pipe(concat('app.min.js'))
    //to ensure Angular dependencies are injected correctly
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/'));
});

// Update index.html to use built js and css files and use correct base href; 
//minify html files
gulp.task('html', function() {
  gulp.src(paths.index)
  .pipe(htmlreplace({
      'css': 'assets/styles.min.css',
      'js': 'app.min.js', 
      'base': '<base href="/">'
  }))
  .pipe(minifyHTML())
  .pipe(gulp.dest('public/'));

  return gulp.src(paths.partials)
  .pipe(minifyHTML())
  .pipe(gulp.dest('public/'));
});

// Images task — copy all images to public folder and minify
gulp.task('images', function() {
  // Image files from app/assets
  gulp.src('client/assets/favicon.ico')
  .pipe(gulp.dest('public/assets/'));
  
  return gulp.src(paths.images)
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
  return gulp.src(paths.styles)
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
    .pipe(open({uri: 'http://localhost:1337/app/'}));
  }, 1500);
});

//Open the correct url for production environment
gulp.task('open-prod', function(){
  setTimeout(function(){
    gulp.src(__filename)
    .pipe(open({uri: 'http://localhost:1337/'}));
  }, 1500);
});
//Run production tasks
gulp.task('production', function(callback){
  runSequence('clean',
    'lint', 
    ['js', 'html', 'styles', 'images'],
    callback); 
});

//Run development environment
gulp.task('development', ['set-dev-node-env','mongo','nodemon','watch', 'open-dev'],function(){
});

//Preview development code
gulp.task('pre-prod', ['set-prod-node-env', 'production', 'mongo','nodemon', 'watch', 'open-prod']);


//Install dependencies and documentation
gulp.task('default', ['documentation'],function() {
  runCommand('npm install -g nodemon');
  gulp.src(['./package.json'])
  .pipe(install());
});

//Add testing tasks 
gulp.task('front-end-test', function(done){
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('front-end-travis', function(done){
  
  new Server({
    configFile: __dirname + '/karma.conf.js',
    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    browsers: ['Chrome_travis_ci'],
    singleRun: true
  }, done).start();
});

gulp.task('back-end-test', function(){
  runCommand('node server/spec/HelperSpec.js');
});

gulp.task('test', ['front-end-test', 'back-end-test']);

