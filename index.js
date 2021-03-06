/**
 * gulp-sakugawa
 * https://github.com/paazmaya/gulp-sakugawa
 *
 * Copyright (c) Juga Paazmaya
 * Licensed under the MIT license.
 */

'use strict';


// through2 is a thin wrapper around node transform streams
var through = require('through2');
var File = require('vinyl');
var path = require('path');

var sakugawa = require('sakugawa');

var StringDecoder = require('string_decoder').StringDecoder;


module.exports = function gulpSakugawa(opts) {
  var options = {
    maxSelectors: opts.maxSelectors || 4090,
    minSheets: opts.minSheets || 1,
    mediaQueries: opts.mediaQueries || 'normal'
  };
  var suffix = opts.suffix || '_';

  var stream = through.obj(function(chunk, enc, cb) {
    if (!chunk.isNull()) {
      var _self = this;
      var decoder = new StringDecoder(enc);
      var css = decoder.write(chunk.contents);
      var extension = chunk.relative.split('.').pop().toLowerCase();
      var filename = (extension === 'css' ? chunk.relative.substring(0, chunk.relative.length - 4) : chunk.relative);

      var pages = sakugawa(css, options);

      pages.forEach(function (page, index) {
        // add new source map file to stream
        var cssFile = new File({
          cwd: chunk.cwd,
          base: chunk.base,
          path: path.join(chunk.base, '', filename) + suffix + (index + 1) + '.css',
          contents: new Buffer(page)
        });
        _self.push(cssFile);
      });
    }
    return cb();
  });

  return stream;
};
