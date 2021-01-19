#!/usr/bin/env node

const blc = require('broken-link-checker');
const https = require('https');
const url = require('url');

const ignoreList = require('./brokenLinkChecker.json').ignore;

const slackUrl =
  "https://hooks.slack.com/services/" +
  process.env.SLACK_ENDPOINT;

let totalLinkCount = 0;
let totalPageCount = 0;
let brokenLinkCount = 0;
let ignoredLinkCount = 0;

/* Returns true if the provided string contains one of the ignored strings.
 * Note that it doesn't need to be an exact match; rather an ignored string
 * must simply appear inside what might be a longer provided string.
 * e.g. if the ignore list contains "testdomain.com/test" then a provided string of
 * "www.testdomain.com/test/first" will match.
 */
function stringContainsIgnoredString(s) {
  return ignoreList.some(i => s.includes(i));
}

function logTextToSlack(text, callback) {
  const slackReqOpts = url.parse(slackUrl);
  slackReqOpts.method = 'POST';
  slackReqOpts.headers = {
    'Content-Type': 'application/json'
  };

  let req = https.request(slackReqOpts, function (res) {
    if (res.statusCode === 200) {
    } else {
      console.log('Slack post status code: ' + res.statusCode);
    }
  });

  let params = { text: text, username: "Broken Link Checker", "icon_emoji": ":koala:" };
  req.write(JSON.stringify(params));
  req.end();
}

let options = { honorRobotExclusions: false };

let siteChecker = new blc.SiteChecker(options, {
  link: function (result, customData) {
    if (result.broken) {
      if (!stringContainsIgnoredString(result.url.resolved)) {
        console.log("Broken link:", result.url.resolved, "in", result.base.resolved);
        logTextToSlack("Broken link: <" + result.url.resolved + "> in <" + result.base.resolved + ">");
        brokenLinkCount++;
      } else {
        console.log("  Found ignored URL:", result.url.resolved);
        ignoredLinkCount++;
      }
    }
    totalLinkCount++;
  },
  page: function (error, pageUrl, customData) {
    totalPageCount++;
  },
  end: function () {
    console.log("Done.");
    logTextToSlack(
      "...end broken link check.\n_(Of " +
      totalLinkCount.toLocaleString() + " links in " +
      totalPageCount.toLocaleString() + " pages, " +
      brokenLinkCount.toLocaleString() + " were broken, and " +
      ignoredLinkCount.toLocaleString() + " were skipped due to ignore list.)_",
      function () {
        process.exit();
      }
    );
  }
});

logTextToSlack(
  "Beginning broken link check...\n_(Ignoring " +
  ignoreList.length.toLocaleString() + " URLs specified in brokenLinkChecker.json)_");

siteChecker.enqueue('https://staging.code.org');
siteChecker.enqueue('https://staging.hourofcode.com');
siteChecker.enqueue('https://staging.csedweek.org');
