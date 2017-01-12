#!/usr/bin/env node

const blc = require('broken-link-checker');
const https = require('https');
const url = require('url');

var whitelist = require('./whitelist.json').ignore;

const slack_url =
  // test room URL
  "https://hooks.slack.com/services/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";

  // staging room URL
  //"https://hooks.slack.com/services/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";

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var totalLinkCount = 0;
var brokenLinkCount = 0;
var whitedlistedLinkCount = 0;

/* Returns true if the provided string contains one of the whitelisted strings.
 * Note that it doesn't need to be an exact match; rather a whitelisted string
 * must simply appear inside what might be a longer provided string.
 * e.g. if the whitelist contains "testdomain.com/test" then a provided string of
 * "www.testdomain.com/test/first" will match.
 */
function stringContainsWhitelistedString(s) {
  for (var i = 0; i < whitelist.length; i++) {
    if (s.indexOf(whitelist[i]) !== -1) {
      return true;
    }
  }

  return false;
}

function logText(text) {
  const slack_req_opts = url.parse(slack_url);
  slack_req_opts.method = 'POST';
  slack_req_opts.headers = {
    'Content-Type': 'application/json'
  };

  var req = https.request(slack_req_opts, function (res) {
    if (res.statusCode === 200) {
    } else {
      console.log('Slack post status code: ' + res.statusCode);
    }
  });

  var params = { text: text, username: "Broken Link Checker", "icon_emoji": ":koala:" };
  req.write(JSON.stringify(params));
  req.end();
}

var options = { honorRobotExclusions: false };

var siteChecker = new blc.SiteChecker(options, {
  link: function (result, customData) {
    if (result.broken) {
      if (!stringContainsWhitelistedString(result.url.resolved)) {
        console.log("Broken link:", result.url.resolved, "in", result.base.resolved);
        logText("Broken link: <" + result.url.resolved + "> in <" + result.base.resolved + ">");
        brokenLinkCount++;
      } else {
        console.log("  Found whitelisted URL:", result.url.resolved);
        whitedlistedLinkCount++;
      }
    }
    totalLinkCount++;
  },
  end: function () {
    logText(
      "...end broken link check.\n_(Of " +
      numberWithCommas(totalLinkCount) + " links, " +
      numberWithCommas(brokenLinkCount) + " were broken, and " +
      numberWithCommas(whitedlistedLinkCount) + " were skipped due to whitelist.)_");
  }
});

logText(
  "Beginning broken link check...\n_(Ignoring " +
  numberWithCommas(whitelist.length) + " URLs specified in whitelist.json)_");

siteChecker.enqueue('https://staging.code.org');

