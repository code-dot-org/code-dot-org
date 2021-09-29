/* eslint-env node, phantomjs */

var system = require('system');
var args = system.args;

if (args.indexOf('--help') !== -1 || args.indexOf('-h') !== -1) {
  console.log('USAGE:');
  console.log('\tphantomjs generateLevelImages [options] [scriptName=course1]');
  console.log('');
  console.log('Options:');
  console.log('\t-h, --help\tprint this usage message');
  console.log(
    '\t--visualization-only\tgenerate only level visualization images for only those levels that have them'
  );
  phantom.exit();
}

var VISUALIZATION_ONLY = false;
if (args.indexOf('--visualization-only') !== -1) {
  VISUALIZATION_ONLY = true;
  args.splice(args.indexOf('--visualization-only'), 1);
}

var COURSE = args[1] || 'course1';

var page = require('webpage').create();

// viewportSize being the actual size of the headless browser
page.viewportSize = {
  width: 1024,
  height: 768
};

// the clipRect is the portion of the page you are taking a screenshot of
page.clipRect = {
  top: 0,
  left: 0,
  width: 1024,
  height: 768
};

/**
 * Repeatedly calls the given checker method until it returns a truthy
 * value, then calls the given callback method with the return from the
 * checker
 * @param {function} checker
 * @param {function} cb
 */
var waitUntil = function(checker, cb) {
  var loaded = false;
  var interval = setInterval(function() {
    loaded = checker();
    if (loaded) {
      cb(loaded);
      clearInterval(interval);
      clearTimeout(timeout);
    }
  }, 100);

  var timeout = setTimeout(function() {
    clearInterval(interval);
    cb();
  }, 5000);
};

var closeDialog = function(p, cb) {
  waitUntil(dialogIsVisible.bind(p), function(rect) {
    if (rect) {
      p.sendEvent(
        'click',
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );
    }
    cb();
  });
};

var dialogIsVisible = function() {
  return this.evaluate(function(s) {
    var element = document.querySelector(s);
    if (element) {
      return element.getBoundingClientRect();
    }
  }, '.x-close');
};

var dialogIsGone = function() {
  return this.evaluate(function(s) {
    return !document.querySelector(s);
  }, '.x-close');
};

var extractTitle = function(page) {
  return page.evaluate(function() {
    var titleRegex = /\/s\/([^\/]*)\/lessons\/(\d*)\/levels\/(\d*)/;
    // location.pathname should look something like
    // '/s/course1/lessons/2/levels/3'
    var matches = titleRegex.exec(location.pathname);

    var course = matches[1],
      lessonNum = matches[2],
      puzzleNum = matches[3];

    // left-pad numbers so filenames are correctly ordered
    if (lessonNum.length < 2) {
      lessonNum = '0' + lessonNum;
    }
    if (puzzleNum.length < 2) {
      puzzleNum = '0' + puzzleNum;
    }

    return course + '_lessons_' + lessonNum + '_levels_' + puzzleNum;
  });
};

var drawGridLines = function(page) {
  page.evaluate(function() {
    var vis = document.getElementById('visualization');
    var svg = document.getElementById('svgMaze');
    var pegman = document.getElementById('pegman');
    if (vis && svg && pegman) {
      Array.prototype.filter
        .call(vis.getElementsByTagName('clipPath'), function(clipPath) {
          return (
            clipPath.id &&
            clipPath.id.startsWith('tile') &&
            clipPath.childNodes.length
          );
        })
        .map(function(tile) {
          return tile.childNodes[0].cloneNode();
        })
        .forEach(function(rect) {
          rect.setAttribute('stroke', 'white');
          rect.setAttribute('fill-opacity', 0);
          svg.insertBefore(rect, pegman);
        });
    }
  });
};

var generateClipRect = function(page) {
  if (VISUALIZATION_ONLY) {
    var clipRect = page.evaluate(function() {
      var vis = document.getElementById('visualization');
      if (vis) {
        return vis.getBoundingClientRect();
      }
    });

    drawGridLines(page);
    return clipRect;
  } else {
    return {
      top: 0,
      left: 0,
      width: page.viewportSize.width,
      height: page.viewportSize.height
    };
  }
};

var screenshot = function(url, cb) {
  page.open(url, function() {
    var title = extractTitle(page);
    console.log(title);
    closeDialog(page, function() {
      waitUntil(dialogIsGone.bind(page), function() {
        var clipRect = generateClipRect(page);
        if (clipRect && clipRect.height && clipRect.width) {
          page.clipRect = clipRect;
          page.render(COURSE + '/' + title + '.png');
        } else {
          console.log('no area to display; skipping');
        }
        cb();
      });
    });
  });
};

// Main method:
page.open('https://levelbuilder-studio.code.org/s/' + COURSE, function() {
  var pages = page.evaluate(function() {
    return Array.prototype.map.call(
      document.querySelectorAll('.react_stage a'),
      function(a) {
        return a.href;
      }
    );
  });

  var finished = 0;
  var total = pages.length;

  var next = function() {
    if (finished === total) {
      phantom.exit();
    }
    screenshot(pages[finished] + '?noautoplay=true', function() {
      finished++;
      console.log(finished + '/' + total);
      next();
    });
  };

  next();
});
