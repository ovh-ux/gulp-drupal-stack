'use strict';

const gulpLoadPlugins = require('gulp-load-plugins');
const join = require('path').join;
const del = require('del');
const buffer = require('vinyl-buffer');
const merge = require('merge-stream');

const $ = gulpLoadPlugins();

module.exports = (gulp, config, tasks) => {
  function sprite() {
    const spriteData = gulp.src(config.sprite.src)
      .pipe($.spritesmith({
        imgName: config.sprite.imgName,
        imgPath: `${config.sprite.imgPathPrefix}${config.sprite.imgName}`,
        cssName: config.sprite.cssName,
        cssSpritesheetName: config.sprite.spritesheetName,
        retinaSrcFilter: config.sprite.retina.enabled ? config.sprite.retina.filter : undefined,
        retinaImgName: config.sprite.retina.enabled ? config.sprite.retina.imgName : undefined,
        retinaImgPath: config.sprite.retina.enabled ? `${config.sprite.imgPathPrefix}${config.sprite.retina.imgName}` : undefined,
        cssRetinaSpritesheetName: config.sprite.retina.enabled ? `${config.sprite.spritesheetName}-2x` : undefined,
        cssVarMap(datas) {
          // eslint-disable-next-line no-param-reassign
          datas.name = `${config.sprite.spritesheetName}-${datas.name}`;
        }
      }));

    // Pipe image stream through image optimizer and onto disk
    const imgStream = spriteData.img
      // DEV: We must buffer our stream into a Buffer for `imagemin`
      .pipe(buffer())
      .pipe($.if(config.sprite.imagemin, $.imagemin()))
      .pipe(gulp.dest(config.sprite.imgDest));

    // Pipe CSS stream onto disk
    const cssStream = spriteData.css
      .pipe(gulp.dest(config.sprite.cssDest));

    // Return a merged stream to handle both `end` events
    return merge(imgStream, cssStream);
  }

  sprite.description = 'Generates a sprite (img and scss files).';

  gulp.task('sprite', sprite);

  gulp.task('clean:sprite', (done) => {
    del([
      join(config.sprite.imgDest, config.sprite.imgName),
      join(config.sprite.cssDest, config.sprite.cssName)
    ], { force: true }).then(() => {
      done();
    });
  });

  gulp.task('watch:sprite', () => {
    gulp.watch(config.sprite.src, sprite);
  });

  tasks.watch.push('watch:sprite');

  tasks.compile.push('sprite');

  tasks.clean.push('clean:sprite');
};
