/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var argv = require('minimist')(process.argv.slice(2));
var dirname = require('path').dirname;
var exec = require('child_process').exec;
var fs = require('fs-extra');
var gulp = require('gulp');
var imageDiff = require('gulp-image-diff');
var util = require('gulp-util');


function doScreenshot(host, path, output, device, verbose, cb) {
  fs.mkdirpSync(dirname(output));
  if (verbose) {
    util.log('Output to: ', output);
  }
  exec('phantomjs --ssl-protocol=any --ignore-ssl-errors=true ' +
       '--load-images=true ' +
      'testing/screenshots/make-screenshot.js ' +
      '"' + host + '" ' +
      '"' + path + '" ' +
      '"' + output + '" ' +
      '"' + device + '" ',
      function(err, stdout, stderr) {
        if (verbose) {
          util.log(util.colors.gray('stdout: ', stdout));
          if (stderr.length) {
            util.log(util.colors.red('stderr: ', stderr));
          }
        }
        if (err != null) {
          util.log(util.colors.red('exec error: ', err));
        }
        cb();
      });
}


/**
 * Ex:
 * `gulp make-golden --path=examples.build/everything.amp.max.html \
 *     --host=http://localhost:8000`
 */
function makeGolden(cb) {
  var path = argv.path;
  var host = argv.host || 'http://localhost:8000';
  var output = argv.output;
  var device = argv.device || 'iPhone6+';
  var verbose = (argv.verbose || argv.v);

  if (!output) {
    output = 'screenshots' + (path && path[0] != '/' ? '/' : '') +
        path + '.png';
  }

  doScreenshot(host, path, output, device, verbose, cb);
}


/**
 * Ex:
 * `gulp diff-screenshots --host=http://localhost:8000`
 */
function testScreenshots(cb) {
  var host = argv.host || 'http://localhost:8000';
  var name = argv.name || 'screenshots';
  var dir = 'build/' + name;
  var verbose = (argv.verbose || argv.v);

  fs.mkdirpSync(dir);
  fs.emptyDirSync(dir);

  var reportFile = dir + '/report.html';
  reportPreambule(reportFile);
  var errorCount = 0;

  function endsWith(s, suffix) {
    return s.indexOf(suffix, s.length - suffix.length) != -1;
  }

  var goldenFiles = [];
  function scanDir(dir) {
    fs.readdirSync(dir).forEach(function(file) {
      var path = dir + '/' + file;
      if (endsWith(file, '.png')) {
        goldenFiles.push(path.replace('screenshots/', ''));
      } else if (fs.statSync(path).isDirectory()) {
        scanDir(path);
      }
    });
  }
  scanDir('screenshots');

  var todo = goldenFiles.length;
  if (verbose) {
    util.log('Diffs to be done: ', todo, goldenFiles);
  }
  goldenFiles.forEach(function(file) {
    diffScreenshot_(file, dir, host, verbose, function(res) {
      reportRecord(reportFile, file, dir, res);
      if (res.error || res.disparity > 0) {
        errorCount++;
        util.log(util.colors.red('Screenshot diff failed: ', file,
            JSON.stringify(res)));
      } else if (verbose) {
        util.log(util.colors.green('Screenshot diff successful: ', file));
      }

      todo--;
      if (todo == 0) {
        reportPostambule(reportFile);
        if (errorCount == 0) {
          util.log(util.colors.green('Screenshots tests successful'));
        } else {
          util.log(util.colors.red('Screenshots tests failed: ', errorCount,
              reportFile));
          process.exit(1);
        }
        cb();
      }
    });
  });
}

function diffScreenshot_(file, dir, host, verbose, cb) {
  if (verbose) {
    util.log('Screenshot diff for ', file);
  }

  var goldenFile = 'screenshots/' + file;
  var goldenCopyFile = dir + '/' + file;
  var htmlPath = file.replace('.png', '');
  var tmpFile = dir + '/' + file.replace('.png', '.tmp.png');
  var diffFile = dir + '/' + file.replace('.png', '.diff.png');

  fs.copySync(goldenFile, goldenCopyFile, {clobber: true});

  doScreenshot(host, htmlPath, tmpFile, 'iPhone6+', verbose, function() {
    // TODO: pixelColorTolerance: 0.10
    gulp.src([tmpFile])
        .pipe(imageDiff({
          referenceImage: goldenCopyFile,
          differenceMapImage: diffFile,
          logProgress: verbose
        }))
        .pipe(imageDiff.jsonReporter())
        .pipe(gulp.dest(diffFile + '.json'))
        .on('error', function(error) {
          util.log(util.colors.red('Screenshot diff failed: ', file, error));
          cb({error: error});
        })
        .on('end', function(res) {
          var contents = fs.readFileSync(diffFile + '.json', 'utf8');
          var json = JSON.parse(contents);
          cb(json[0]);
        });
  });
}

function reportPreambule(reportFile) {
  fs.writeFileSync(reportFile,
      '<html>' +
      '<head><style>.thumb{display: block; width: 100px; height: 100px;}' +
          ' .thumb img{display: block; width: auto; height: auto;' +
              'margin: auto; max-width: 100%; max-height: 100%;}' +
          ' .result {text-align: center;}' +
          ' .error {background: red} .success {background: green}' +
      '</style></head>' +
      '<body><h1>Screenshot Diffs</h1><table width=100%>' +
      '<thead><tr>' +
      '<th>Path</th>' +
      '<th>Result</th>' +
      '<th>Golden</th>' +
      '<th>Work</th>' +
      '<th>Diff</th>' +
      '</tr></thead>' +
      '<tbody>',
      'utf8');
}

function reportPostambule(reportFile) {
  fs.appendFileSync(reportFile,
      '</tbody></table></body></html>',
      'utf8');
}

function reportRecord(reportFile, file, dir, record) {

  function thumb(file) {
    file = file.replace(dir + '/', '');
    return '<a class=thumb target=_blank href="' + file + '">' +
        '<img src="' + file + '">' +
        '</a>';
  }

  fs.appendFileSync(reportFile,
      '<tr>' +
      '<td>' + file + '</td>' +
      '<td><div class="result ' +
          (record.disparity > 0 ? 'error' : 'success') + '">' +
          record.disparity + '</div></td>' +
      '<td align=center>' + thumb(record.referenceImage) + '</td>' +
      '<td align=center>' + thumb(record.compareImage) + '</td>' +
      '<td align=center>' + thumb(record.differenceMap) + '</td>' +
      '</tr>',
      'utf8');
}


gulp.task('make-golden', makeGolden);
gulp.task('test-screenshots', testScreenshots);
