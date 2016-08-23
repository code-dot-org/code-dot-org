/* eslint-env node, phantomjs */

var system = require('system');
var args = system.args;

if (args.indexOf("--help") !== -1 || args.indexOf("-h") !== -1) {
  console.log("USAGE:");
  console.log("\tphantomjs generateLevelImages [options] [scriptName=course1]");
  console.log("");
  console.log("Options:");
  console.log("\t-h, --help\tprint this usage message");
  console.log("\t--grid-only\tgenerate only maze grid images for only those levels that have them");
  phantom.exit();
}

var GRID_ONLY = false;
if (args.indexOf("--grid-only") !== -1) {
  GRID_ONLY = true;
  args.splice(args.indexOf("--grid-only"), 1);
}

var COURSE = args[1] || 'course1';

var webpage = require('webpage');
var page = require('webpage').create();

// viewportSize being the actual size of the headless browser
page.viewportSize = { width: 1024, height: 768 };

// the clipRect is the portion of the page you are taking a screenshot of
page.clipRect = { top: 0, left: 0, width: 1024, height: 768 };

/**
 * Repeatedly calls the given checker method until it returns a truthy
 * value, then calls the given callback method with the return from the
 * checker
 * @param {function} checker
 * @param {function} cb
 */
var waitUntil = function (checker, cb) {
  var loaded = false;
  var interval = setInterval(function () {
    loaded = checker();
    if (loaded) {
      cb(loaded);
      clearInterval(interval);
      clearTimeout(timeout);
    }
  }, 100);

  var timeout = setTimeout(function () {
    clearInterval(interval);
    cb();
  }, 5000);
};

var closeDialog = function (p, cb) {
  waitUntil(dialogIsVisible.bind(p), function (rect) {
    if (rect) {
      p.sendEvent('click', rect.left + (rect.width/2), rect.top + (rect.height/2));
    }
    cb();
  });
};

var dialogIsVisible = function () {
  return this.evaluate(function (s) {
    var element = document.querySelector(s);
    if (element) {
      return element.getBoundingClientRect();
    }
  }, '.x-close');
};

var dialogIsGone = function () {
  return this.evaluate(function (s) {
    return !document.querySelector(s);
  }, '.x-close');
};

var calloutsAreVisible = function () {
  return this.evaluate(function (s) {
    var elements = document.querySelectorAll(s);
    if (elements) {
      return Array.prototype.map.call(elements, function (e) { return e.getBoundingClientRect();});
    }
  }, '.tooltip-x-close');
};

var calloutsAreGone = function () {
  return this.evaluate(function (s) {
    var elements = document.querySelectorAll(s);
    return Array.prototype.every.call(elements, function (e) {
      return e.getBoundingClientRect().width === 0 && e.getBoundingClientRect().height === 0;
    });
  }, '.tooltip-x-close');
};

var closeCallouts = function (p, cb) {
  waitUntil(calloutsAreVisible.bind(p), function (rects) {
    if (rects) {
      rects.forEach(function (rect) {
        p.sendEvent('click', rect.left + (rect.width/2), rect.top + (rect.height/2));
      });
    }
    cb();
  });
};

var screenshot = function (url, cb) {
  page.open(url, function () {
    var title = page.evaluate(function () {
      var titleRegex = /\/s\/([^\/]*)\/stage\/(\d*)\/puzzle\/(\d*)/;
      // location.pathname should look something like
      // '/s/course1/stage/2/puzzle/3'
      var matches = titleRegex.exec(location.pathname);

      var course = matches[1],
          stageNum = matches[2],
          puzzleNum = matches[3];

      // left-pad numbers so filenames are correctly ordered
      if (stageNum.length < 2) {
        stageNum = "0" + stageNum;
      }
      if (puzzleNum.length < 2) {
        puzzleNum = "0" + puzzleNum;
      }

      return course + "_stage_" + stageNum + "_puzzle_" + puzzleNum;
    });
    console.log(title);
    closeDialog(page, function () {
      waitUntil(dialogIsGone.bind(page), function () {
        if (GRID_ONLY) {
          var clipRect = page.evaluate(function () {
            var vis = document.getElementById('visualization');
            var pegman = document.getElementById('pegman');
            var svg = document.getElementById('svgMaze');
            if (vis && pegman && svg) {
              Array.prototype.filter.call(vis.getElementsByTagName('clipPath'), function (clipPath) {
                return (clipPath.id && clipPath.id.startsWith('tile') && clipPath.childNodes.length);
              }).map(function (tile) {
                return tile.childNodes[0].cloneNode();
              }).forEach(function (rect) {
                rect.setAttribute('stroke', "white");
                rect.setAttribute('fill-opacity', 0);
                svg.insertBefore(rect, pegman);
              });
              return vis.getBoundingClientRect();
            }
          });
          if (clipRect) {
            page.clipRect = clipRect;
            page.render(COURSE + '/' + title + '.png');
          }
        } else {
          page.render(COURSE + '/' + title + '.png');
        }
        cb();
      });
    });
  });
};

// Main method:
page.open('https://levelbuilder-studio.code.org/s/' + COURSE, function () {
  var pages = page.evaluate(function () {
    return Array.prototype.map.call(document.querySelectorAll('.react_stage a'), function (a) {
      return a.href;
    });
  });

  var finished = 0;
  var total = pages.length;

  var next = function () {
    if (finished === total) {
      phantom.exit();
    }
    screenshot(pages[finished] + "?noautoplay=true", function () {
      finished++;
      console.log(finished + "/" + total);
      next();
    });
  };

  next();
});

