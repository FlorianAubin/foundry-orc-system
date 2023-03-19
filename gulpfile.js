var gulp = require("gulp");
var less = require("gulp-less");

gulp.task("less", function (cb) {
  gulp.src("styles/less/orc.less").pipe(less()).pipe(gulp.dest("./"));
  cb();
});

gulp.task(
  "default",
  gulp.series("less", function (cb) {
    gulp.watch("styles/less/*.less", gulp.series("less"));
    cb();
  })
);
