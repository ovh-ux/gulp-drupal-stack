'use strict';

const rename = require('gulp-rename');
const svgmin = require('gulp-svgmin');
const svgSprite = require('gulp-svg-sprite');
const path = require('path');
const glob = require('glob');
const del = require('del');

module.exports = (gulp, config, tasks) => {
  function createSpriteSvg() {
    return glob(config.spritesvg.src, (err, dirs) => {
      dirs.forEach((dir) => {
        gulp.src(path.join(dir, '*.svg'))
          .pipe(rename({ prefix: config.spritesvg.prefix }))
          .pipe(svgmin({
            // see: https://github.com/svg/svgo
            // see: https://github.com/jakearchibald/svgomg/blob/master/src/js/svgo-worker/index.js
            // see: https://github.com/svg/svgo/issues/439
            plugins: [
              { removeDoctype: true },
              { removeXMLProcInst: true },
              { removeComments: true },
              { removeMetadata: true },
              { removeXMLNS: false }, // default
              { removeEditorsNSData: true },
              { cleanupAttrs: true },
              { minifyStyles: true },
              { convertStyleToAttrs: true },
              {
                cleanupIDs:
                {
                  minify: true,
                  remove: true,
                  force: true
                }
              },
              { removeRasterImages: false }, // default
              { removeUselessDefs: true },
              { cleanupNumericValues: true },
              { cleanupListOfValues: true },
              { convertColors: true },
              { removeUnknownsAndDefaults: true },
              { removeNonInheritableGroupAttrs: true },
              { removeUselessStrokeAndFill: true },
              { removeViewBox: false }, // default
              { cleanupEnableBackground: true },
              { removeHiddenElems: true },
              { removeEmptyText: true },
              { convertShapeToPath: true },
              { moveElemsAttrsToGroup: true },
              { moveGroupAttrsToElems: true },
              { collapseGroups: true },
              { convertPathData: true },
              { convertTransform: true },
              { removeEmptyAttrs: true },
              { removeEmptyContainers: true },
              { mergePaths: true },
              { removeUnusedNS: true },
              { sortAttrs: true }, // not default
              { removeTitle: true },
              { removeDesc: true },
              { removeDimensions: true }, // not default
              {
                removeAttrs: {
                  attrs: ['xmlns', '(stroke|fill)']
                }
              },
              { removeElementsByAttr: false }, // default
              { addClassesToSVGElement: false }, // default
              { removeStyleElement: false }, // default
              { removeScriptElement: false }, // default
              { addAttributesToSVGElement: false } // default
            ],
            js2svg: {
              pretty: true
            }
          }))
          .pipe(svgSprite({
            mode: {
              symbol: {
                dest: '.',
                example: false,
                sprite: 'sprite.svg'
              }
            }
          }))
          .pipe(gulp.dest(config.spritesvg.dest));
      });
    });
  }

  gulp.task('clean:spritesvg', (done) => {
    del([
      `${config.spritesvg.dest}*.svg`
    ], { force: true }).then(() => {
      done();
    });
  });

  gulp.task('spritesvg', createSpriteSvg);

  tasks.clean.push('clean:spritesvg');
  tasks.compile.push('spritesvg');
};
