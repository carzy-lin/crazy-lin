const    gulp = require('gulp');   
const    sass = require('gulp-sass');              //sass的编译
const    babel = require('gulp-babel');
const    rename = require('gulp-rename');
const    autoprefixer = require('gulp-autoprefixer');   //自动添加css前缀
const    minifycss = require('gulp-minify-css');        //压缩css
const    uglify = require('gulp-uglify');               //压缩js代码
const    imagemin = require('gulp-imagemin');           //压缩图片            
const    clean = require('gulp-clean');                
const    concat = require('gulp-concat');              //合并js文件
const    cache = require('gulp-cache');                //图片缓存
const    livereload = require('gulp-livereload');       //自动刷新页面
const    revappend = require('gulp-rev-append');                     //处理hash值
const    rev = require('gulp-rev'); 
const    htmlmin = require('gulp-htmlmin');              //html 处理
const    revCollector = require("gulp-rev-collector");   //路径替换
const    replace = require('gulp-replace');//文件名替换
const    connect = require('gulp-connect');

var htmlSrc = ('src/**/*.html'),
    htmlDst = 'dist';


//js
gulp.task('scripts',function(){
	return gulp.src(['./common/js/**/*.js','!./common/js/**/*min.js'])  //引入js的文件路径,如果有压缩的js的话就不压缩。
           .pipe(babel({  
                presets:['es2015']  
            }))
	       .pipe(uglify())    //压缩js文件
	       .pipe(rename({ suffix: '.min' }))
	       .pipe(gulp.dest('dist/common/js'))       //打包后的文件路径
	       
});


//css
gulp.task('stylesmd5',function(){
	return gulp.src('common/css/**/*.css')
	       .pipe(autoprefixer('last 2 version','safar 5','ie 8','ie 9','opera 12.1','ios 6','android 4'))
	       .pipe(sass({style: 'compressed',}))   //样式输出风格
	       .pipe(rename({suffix:'.min'}))
	       .pipe(minifycss())
	       .pipe(rev())
	       .pipe(gulp.dest('dist/common/css'))
	       //.pipe(rev.manifest('rev-css-manifest.json'))  //生成一个rev-manifest.json
	       


})

//image
gulp.task('image',function() {
	 return gulp.src('common/image/*')
	 .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
	 .pipe(gulp.dest('dist/common/image'))

})

gulp.task('html',function(){
		 var options = {
	removeComments: true,//清除HTML注释
	collapseWhitespace: false,//压缩HTML
	collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
	removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
	removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
	removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
	minifyJS: true,//压缩页面JS
	minifyCSS: true//压缩页面CSS
	}
	 
	return	 gulp.src(['dist/rev-manifest-seajs.json',htmlSrc])
	         .pipe( revCollector({
               replaceReved: true,
	             dirReplacements: {
	                'css': 'css'
	             }
             })
             )
			 .pipe(htmlmin(options))
			 .pipe(gulp.dest(htmlDst));//同名的html,会直接替换
})


//使用rev替换成md5文件名，这里包括html和css的资源文件也一起
gulp.task('rev', function() {
    //html，针对js,css,img
    return gulp.src(['dist/*.json',htmlSrc])
           .pipe(revCollector())
           .pipe(gulp.dest(htmlDst));
});


/** 字体图标 **/
gulp.task('fonts', function () {
    gulp.src(['common/fonts/*'])
        .pipe(gulp.dest('dist/common/fonts/'));
});

/** 使用connect启动一个Web服务器 **/
gulp.task('connect', function () {
    connect.server({
        //root: 'dist1/',
        livereload: true,
        port: 8888
    });
});

/** 刷新页面 **/
gulp.task('reload', function () {
    gulp.src('src/**/*.html')
        .pipe(connect.reload());
});

/** 监测文件变动，设置自动执行的任务 **/
gulp.task('watch', function () {
    gulp.watch('common/css/**/*.css', ['stylesmd5', 'reload']);                   // 当所有less文件发生改变时，调用less任务
    gulp.watch('common/css/**/*.js', ['scripts', 'reload']);                   // 当所有js文件发生改变时，调用js任务
    gulp.watch('src/**/*.html', ['html', 'reload']); // 当所有模板文件变化时，重新生成生成页面到根目录
    gulp.watch('common/image/*', ['image']);                    // 监听images
});


// 清除dist文件夹
gulp.task('clean', function() {   
  return gulp.src(['dist'], {read: false})  
    .pipe(clean());  
});  
   

// 预设任务  
gulp.task('default', ['scripts','html','image','rev','stylesmd5','fonts','reload','connect','watch']); 

