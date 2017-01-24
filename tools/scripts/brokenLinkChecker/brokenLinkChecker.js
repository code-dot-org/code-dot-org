#!/usr/bin/env node

const blc = require('broken-link-checker');
const https = require('https');
const url = require('url');
const YAML = require('yamljs');
const path = require("path");

const whitelist = require('./whitelist.json').ignore;

const slackUrl =
  "https://hooks.slack.com/services/" +
  YAML.load(path.join(__dirname, '..', '..', '..', 'globals.yml'))['slack_endpoint'];

let totalLinkCount = 0;
let totalPageCount = 0;
let brokenLinkCount = 0;
let whitedlistedLinkCount = 0;

/* Returns true if the provided string contains one of the whitelisted strings.
 * Note that it doesn't need to be an exact match; rather a whitelisted string
 * must simply appear inside what might be a longer provided string.
 * e.g. if the whitelist contains "testdomain.com/test" then a provided string of
 * "www.testdomain.com/test/first" will match.
 */
function stringContainsWhitelistedString(s) {
  return whitelist.some(w => s.includes(w));
}

function logTextToSlack(text) {
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
      if (!stringContainsWhitelistedString(result.url.resolved)) {
        console.log("Broken link:", result.url.resolved, "in", result.base.resolved);
        logTextToSlack("Broken link: <" + result.url.resolved + "> in <" + result.base.resolved + ">");
        brokenLinkCount++;
      } else {
        console.log("  Found whitelisted URL:", result.url.resolved);
        whitedlistedLinkCount++;
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
      whitedlistedLinkCount.toLocaleString() + " were skipped due to whitelist.)_");
  }
});

logTextToSlack(
  "Beginning broken link check...\n_(Ignoring " +
  whitelist.length.toLocaleString() + " URLs specified in whitelist.json)_");

siteChecker.enqueue('https://staging.code.org');

