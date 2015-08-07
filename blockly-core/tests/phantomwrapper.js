var fs = require('fs');
var WebPage = require('webpage');

var DEFAULT_STYLE = "\033[39m";
var GREEN = "\033[32m";
var RED = "\033[31m";

/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * Lifted from this phantomjs example:
 * https://github.com/ariya/phantomjs/blob/master/examples/waitfor.js
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 10 sec is used.
 */
function waitFor(testFx, onReady, timeOutMillis) {
  var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 10000, //< Default Max Timout is 10s
      start = new Date().getTime(),
      condition = false,
      interval = setInterval(function() {
        if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
          // If not time-out yet and condition not yet fulfilled
          condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
        } else {
          if(!condition) {
            // If condition still not fulfilled (timeout but condition is 'false')
            console.log("Tests timed out at " + maxtimeOutMillis + "ms");
            phantom.exit(1);
          } else {
            // Condition fulfilled (timeout and/or condition is 'true')
            typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
            clearInterval(interval); //< Stop this interval
          }
        }
      }, 250); //< repeat check every 250ms
}

// This is a thin wrapper around using phantomjs to load and run the blockly core tests
var page = WebPage.create();
var path = 'file://' + fs.absolute('blockly_test.html');
console.log("Loading blockly-core test page with phantomjs");
page.open(path, function (status) {
  if (status !== 'success') {
    console.log(RED + "PhantomJS failed to load test page" + DEFAULT_STYLE);
    phantom.exit(1);
    return;
  }

  waitFor(function () {
    // Wait until we either see a success or failure message
    return /\[(?:PASSED|FAILED)\]/.test(page.plainText);
  }, function () {

    // Color-code output
    console.log(page.plainText
        .replace(/PASSED/g, GREEN + '$&' + DEFAULT_STYLE)
        .replace(/FAILED/g, RED + '$&' + DEFAULT_STYLE));

    if (/\[FAILED\]/.test(page.plainText)) {
      console.log(RED + "Blockly-Core tests failed" + DEFAULT_STYLE);
      phantom.exit(1);
      return;
    }

    console.log(GREEN + "Blockly-Core tests passed" + DEFAULT_STYLE);
    phantom.exit(0);
  });
});

