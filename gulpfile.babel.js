const gulp = require('gulp'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano'),
    gulpCopy = require('gulp-copy'),
    imageMin = require('gulp-imagemin'),
    cleanCSS = require('gulp-clean-css'),
    // sourcemaps = require('gulp-sourcemaps'),
    uglifyJs = require('gulp-uglify'),
    concat = require ('gulp-concat'),
    merge = require('merge-stream'),
    htmlmin = require('gulp-htmlmin'),
    htmlreplace = require('gulp-html-replace'),
    browserSync = require('browser-sync').create(),
    babel = require('gulp-babel'),
    // server = browserSync.create();
    // reload = browserSync.reload
    del = require('del');

//  Paths

const paths = {
  styles: {
    src: 'assets/sass/**/*.scss',

    dest: 'src/css',

    prod: 'src/css/*.css',

    prodDest: 'dist/css'
  },

  scripts: {
      src: 'assets/js/**/*.js',

      dest: 'dist/js'
  },

  images: {
      src: 'src/img/**/*.{jpg,png,gif,svg}',

      dest: 'dist/img'
  },

  html: {
      src: 'src/**/*.html',

      dest: 'dist/'
  },

  video: {
        src: 'src/video/**',

        dest: 'dist/video/'
  },

  pdf: {
        src: 'src/*.pdf',

        dest: 'dist/'
  }
  
}

//  Shared Tasks

const clean = () => del(['dist']);


//  Development build specific tasks


 function html() {
     return gulp.src([paths.html.src, 'src/*.php'])
        .pipe(gulp.dest(paths.html.dest));
 }

 function video() {
     return gulp.src(paths.video.src)
        .pipe(gulp.dest(paths.video.dest))
 }

 function pdf() {
     return gulp.src(paths.pdf.src)
        .pipe(gulp.dest(paths.pdf.dest))
 }

 function scripts(done) {
     return gulp.src(paths.scripts.src
        // , {sourcemaps:true }
        )
        //  .pipe(sourcemaps.init())
         .pipe(babel({
             presets: ['@babel/preset-env']
         }))
         .pipe(uglifyJs())
        //  .pipe(concat('index.min.js'))

    .pipe(gulp.dest('./src/js')),
    done()
 }

 function styles() {
     let plugins = [
         autoprefixer(),
         cssnano()
     ]
     return gulp.src(paths.styles.src)
        // .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        })
        .on('error', sass.logError))
        .pipe(postcss(plugins))
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.stream());
 }

 function images() {
     return gulp.src(paths.images.src)
        
        .pipe(gulp.dest('src/img'));
 }
 

 function reload(done) {
     browserSync.reload();
     done();
 }

 function serve() {
     browserSync.init({
         server: {
             baseDir: "./src"
         },
         notify: true,
         open: false
     });
 }

 gulp.task('app', gulp.parallel(html, styles, scripts, images, video, pdf));
 gulp.task('build', gulp.series(clean, 'app'));


 // Watch Tasks

 function watchHtml() {
    
    console.log("Watching: " + paths.html.src);
    console.log("Watching: " + 'src/*.php')
    gulp.watch(paths.html.src, html).on('change', gulp.series(clean, html, reload))
    gulp.watch('src/*.php').on('change', gulp.series(clean, html, reload))
    gulp.watch('src/video').on('change', gulp.series(clean, video, reload))
 }

 function watchStyles() {
     console.log("Watching: " + paths.styles.src);
     gulp.watch(paths.styles.src, styles).on('change', gulp.series(clean, styles, reload))
 }

 function watchScripts(done) {
        console.log("Watching: " + paths.scripts.src);
        gulp.watch(paths.scripts.src, scripts).on('change', gulp.series(clean, scripts, reload))
        done();
}

 gulp.task('watch', gulp.parallel(clean, watchHtml, watchStyles, watchScripts, serve));


//  Production Specific Tasks

gulp.task('styles:prod', function () {
    var sassStream = gulp.src(paths.styles.prod)

    return merge (sassStream)
        // .pipe(concat('all.min.css'))
        .pipe(cleanCSS({ specialComments: 0 }))
        .pipe(gulp.dest(paths.styles.prodDest));
});

gulp.task('scripts:prod', function() {
    var jsStream = gulp.src(paths.scripts.src);

    return merge(jsStream) 
        // .pipe(sourcemaps.init())
        // .pipe(concat('all.min.js'))
        
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(concat('all.min.js'))             //  Makes all JavaScript files into one
        .pipe(uglifyJs())                       //  Minify all JavaScript Files
        // .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(paths.scripts.dest))
})

/*
 *  cache(imageMin()) is going off until i find fix for JPEG output error
*/

gulp.task('images:prod', function() {
    return gulp.src(paths.images.src)
        // .pipe(cache(imageMin()))
        .pipe(imageMin({ 
            interlaced: true,
            progressive: true,
            optimizationLevel: 5 
        }, {
            verbose: true
        }))
        .on('error', function(e) { console.log(e); })
        .pipe(gulp.dest(paths.images.dest));
});

gulp.task('html:prod', function() {
    return gulp.src(paths.html.src)
        .pipe(htmlmin({ 
            collapseWhitespace: true,
            ignoreCustomFragments: [ /<%[\s\S]*?%>/, /<\?[=|php]?[\s\S]*?\?>/ ] 
        }))
        .pipe(htmlreplace({
            'js': 'js/all.min.js'
        }))
        .pipe(gulp.dest(paths.html.dest));
});

gulp.task('video:prod', function() {
    return gulp.src(paths.video.src)
        .pipe(gulp.dest(paths.video.dest))
})

gulp.task('php:prod', function() {
    return gulp.src('src/*.php')
        .pipe(gulp.dest('dist/'))
})

gulp.task('pdf:prod', function() {
    return gulp.src(paths.pdf.src)
       .pipe(gulp.dest(paths.pdf.dest))
});

gulp.task('all:prod', gulp.parallel(
    'styles:prod', 'scripts:prod', 'html:prod', 
    'images:prod', 'pdf:prod', 'php:prod', 'video:prod'
));

gulp.task('build:prod', gulp.series(clean, 'all:prod'));

//  Default Task
gulp.task('default', gulp.parallel('build', 'watch'))