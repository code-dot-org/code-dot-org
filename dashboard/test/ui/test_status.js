// Scripts that operate the test status page.  We expect the page to be
// prepopulated with tables listing all of the tests we are going to run
// (see runner.rb and test_status.haml for how this happens) but the actual
// status of those tests we retrieve asynchronously in one of two ways:
// 1. from a server API (see test_logs_controller.rb) which in turn gets its
//    information from the uploaded S3 logs and their metadata. This mode
//    is faster.
// 2. directly fetching the metadata from S3 via HEAD requests, this mode
//    is slower, but allows us to be hosted as static HTML on S3 w/o a backend.

// Globals are provided on test_status.html
/* global _, Clipboard, setTabStatusIcon */

// Gather metadata for the run
const COMMIT_HASH = document.querySelector("#commit-hash").dataset.hash;
const RUN_START_TIME = new Date(
  document.querySelector("#start-time").textContent
);
const TEST_TYPE = document.querySelector("#test-type").value;
const API_ORIGIN = document.querySelector("#api-origin").value;
const S3_BUCKET = document.querySelector("#s3-bucket").value;
const S3_PREFIX = document.querySelector("#s3-prefix").value;

// Simple constants
const STATUS_PENDING = "PENDING";
const STATUS_FAILED = "FAILED";
const STATUS_SUCCEEDED = "SUCCEEDED";

// Derived constants
const S3_KEY_SUFFIX = `${/eyes/i.test(TEST_TYPE) ? "_eyes" : ""}_output.html`;
const API_BASEPATH = `${API_ORIGIN}/api/v1/test_logs`;

// Grab DOM references
let lastRefreshTimeLabel = document.querySelector("#last-refresh-time");
let refreshButton = document.querySelector("#refresh-button");
let autoRefreshButton = document.querySelector("#auto-refresh-button");

var lastRefreshTime = RUN_START_TIME;

function Test(fromRow) {
  /** @type {HTMLRowElement} */
  this.row = fromRow;

  /** @type {string} */
  this.browser =
    typeof this.row.dataset.browser === "string"
      ? this.row.dataset.browser
      : "UnknownBrowser";

  /** @type {string} */
  this.feature = this.row.dataset.feature;

  /** @type {string} */
  this.versionId = null;

  /** @type {number} */
  this.attempt = 0;

  /** @type {boolean} */
  this.success = false;

  /** @type {number} in seconds */
  this.duration = 0;

  /** @type {string} */
  this.status = STATUS_PENDING;

  /** @private {Date} */
  this.lastModified_ = null;

  /** @private {boolean} */
  this.isUpdating_ = false;

  // Do an intitial render to put everything in a consistent state.
  this.updateView();
}

Test.prototype.setLastModified = function (object, lastModified) {
  // Do no updating if things haven't changed.
  if (this.lastModified_ && lastModified <= this.lastModified_) {
    return Promise.resolve();
  }

  if (lastModified > RUN_START_TIME && this.status !== STATUS_SUCCEEDED) {
    return this.fetchStatus(object).then(
      () => (this.lastModified_ = lastModified)
    );
  } else {
    this.lastModified_ = lastModified;
    this.updateView();
    return Promise.resolve();
  }
};

Test.prototype.fetchStatus = function (object) {
  this.isUpdating_ = true;
  this.updateView();
  const ensure = () => {
    this.isUpdating_ = false;
    this.updateView();
  };

  return Promise.resolve(object)
    .then((json) => {
      if (json.commit === COMMIT_HASH) {
        this.versionId = json.version_id;
        this.attempt = parseInt(json.attempt, 10);
        this.success = json.success === "true";
        this.duration = parseInt(json.duration, 10);
        this.status = this.success ? STATUS_SUCCEEDED : STATUS_FAILED;
      }
    })
    .then(ensure, (error) => {
      ensure();
      throw error;
    });
};

Test.prototype.updateView = function () {
  const succeeded = this.status === STATUS_SUCCEEDED;
  const failed = this.status === STATUS_FAILED;

  // Get references to row elements
  let row = this.row;
  let statusCell = row.querySelector(".status");
  let logLinkCell = row.querySelector(".log-link");

  // Update row appearance
  row.className = this.status;
  if (succeeded || failed) {
    var formatDurn = new Date(this.duration * 1000);

    statusCell.innerHTML =
      (succeeded ? "Succeeded" : "Failed") +
      ` in ${formatDurn.getUTCHours()} hr ${formatDurn.getUTCMinutes()} min ${formatDurn.getUTCSeconds()} sec` +
      (this.attempt > 0 ? ` on retry #${this.attempt}` : "");
    logLinkCell.innerHTML = `<a href="${this.publicLogUrl()}">Log on S3</a>`;
  } else {
    statusCell.innerHTML = "";
    logLinkCell.innerHTML = "";
  }

  if (this.isUpdating_) {
    statusCell.innerHTML += " (Updating)";
  }

  // Call debounced global progress update
  updateProgress && updateProgress();
};

Test.prototype.s3Key = function () {
  const featureRegex = /features\/(.*)\.feature/i;
  const result = featureRegex.exec(this.feature);
  const featureName = result[1].replace(/\//g, "_");
  return `${S3_PREFIX}/${this.browser}_${featureName}${S3_KEY_SUFFIX}`;
};

Test.prototype.publicLogUrl = function () {
  return `https://${S3_BUCKET}.s3.amazonaws.com/${this.s3Key()}?versionId=${
    this.versionId
  }`;
};

// Connect up "Copy Rerun Command" buttons
new Clipboard("button.copy-button");

function keyify(str) {
  return str.replace(/\//g, "_");
}

// Build a cache of tests for this run.
var tests = {};
var rows = document.querySelectorAll("tbody tr");
rows.forEach((row) => {
  let test = new Test(row);
  tests[test.browser] = tests[test.browser] || {};
  tests[test.browser][keyify(test.feature)] = test;
});

function testFromS3Key(key) {
  let escapedPrefix = S3_PREFIX.replace(/\//g, "/");
  let escapedSuffix = S3_KEY_SUFFIX.replace(/\./g, "\\.");
  var result = new RegExp(
    `${escapedPrefix}\/([^_]+)_(.*)${escapedSuffix}`,
    "i"
  ).exec(key);
  // Ignore tests with a different suffix (from other runs, e.g. eyes vs. non-eyes).
  if (!result) {
    return undefined;
  }
  var browser = result[1];
  var feature = `features/${result[2]}.feature`;
  // If we don't have the browser, we definitely don't have the test.
  if (!tests[browser]) {
    return undefined;
  }

  return tests[browser][keyify(feature)];
}

function calculateBrowserProgress(browser) {
  let successCount = 0,
    failureCount = 0,
    pendingCount = 0;
  for (let feature in tests[browser]) {
    let status = tests[browser][feature].status;
    if (status === STATUS_PENDING) {
      pendingCount++;
    } else if (status === STATUS_FAILED) {
      failureCount++;
    } else if (status === STATUS_SUCCEEDED) {
      successCount++;
    }
  }
  return {
    successCount,
    failureCount,
    pendingCount,
  };
}

function renderBrowserProgress(browser, progress) {
  let { successCount, failureCount, pendingCount } = progress;
  let totalCount = successCount + failureCount + pendingCount;

  // DOM references
  let progressDiv = document.querySelector(`#${browser}-progress`);
  let progressText = progressDiv.querySelector(".progress-text");
  let progressBar = progressDiv.querySelector(".progress-bar");
  let successBar = progressBar.querySelector(".success");
  let failureBar = progressBar.querySelector(".failure");
  let pendingBar = progressBar.querySelector(".pending");

  // We manipulate the percentages to make them round numbers, adding up to 100,
  // and each category gets at least 1% if its count is greater than zero.
  let successPercent = Math.max(
    Math.floor((successCount * 1000) / totalCount) / 10,
    successCount > 0 ? 0.1 : 0
  );
  let failurePercent = Math.max(
    Math.floor((failureCount * 1000) / totalCount) / 10,
    failureCount > 0 ? 0.1 : 0
  );
  let pendingPercent = Math.max(
    Math.floor((pendingCount * 1000) / totalCount) / 10,
    pendingCount > 0 ? 0.1 : 0
  );
  let leftover = 100 - (successPercent + failurePercent + pendingPercent);
  if (leftover > 0) {
    if (pendingCount > 0) {
      pendingPercent += leftover;
    } else if (failureCount > 0) {
      failurePercent += leftover;
    } else {
      successPercent += leftover;
    }
  } else if (leftover < 0) {
    if (successCount + leftover > 0) {
      successPercent += leftover;
    } else if (failureCount + leftover > 0) {
      failurePercent += leftover;
    } else {
      pendingPercent += leftover;
    }
  }

  // Set progress text
  let runPercent = successPercent + failurePercent;
  progressText.textContent =
    `${runPercent}% of ${totalCount} tests have run.` +
    ` ${successCount} passed,` +
    ` ${failureCount} failed,` +
    ` ${pendingCount} are pending.`;

  // Update the progress bar
  successBar.style.width = `${successPercent}%`;
  failureBar.style.width = `${failurePercent}%`;
  pendingBar.style.width = `${pendingPercent}%`;
}

function updateProgressNow() {
  // Count up tests by status
  let successCount = 0,
    failureCount = 0,
    pendingCount = 0;
  for (let browser in tests) {
    let browserProgress = calculateBrowserProgress(browser);
    renderBrowserProgress(browser, browserProgress);
    successCount += browserProgress.successCount;
    failureCount += browserProgress.failureCount;
    pendingCount += browserProgress.pendingCount;
  }
  renderBrowserProgress("total", {
    successCount,
    failureCount,
    pendingCount,
  });

  // Set the tab's status icon according to how complete the test run is
  if (failureCount > 0) {
    setTabStatusIcon("fail");
  } else if (pendingCount > 0) {
    setTabStatusIcon("in-progress");
  } else {
    setTabStatusIcon("pass");
  }

  // Disable auto-refresh if the test run is done and green.
  if (pendingCount + failureCount === 0) {
    disableAutoRefresh();
  }
}
var updateProgress = _.debounce(updateProgressNow, 300, { maxWait: 3000 });

// maps HTTP headers returned from S3 by a HEAD request to the same names as test_logs_controller.rb returns
const s3HeaderToMetadataKey = httpHeaderName =>
  httpHeaderName === 'x-amz-version-id'
    ? 'version_id'
    : httpHeaderName.replace(/^x-amz-meta-/, '').replaceAll('-', '_');

// Fetch test results directly from S3, already stored as object metadata on each *_output.html file
// This function is used when running as static HTML. In this condition, the test_status_UI.html (etc)
// pages we're running in will be served from the same S3 bucket, and therefore domain, as the *_output.html
// files. Therefore, there is no CORS issue doing HEAD requests against them.
async function fetchMetadataDirectlyFromS3For(browser, featureKey) {
  const featureFilename = featureKey.replace(/^features_/, '').replace(/\.feature$/, '');
  const s3Key = `${S3_PREFIX}/${browser}_${featureFilename}${S3_KEY_SUFFIX}`;
  const url = `https://${S3_BUCKET}.s3.amazonaws.com/${s3Key}`;

  const res = await fetch(url, { method: 'HEAD' });
  if (!res.ok) {
    console.error(`HTTP ${res.status}: trying to fetch ${url} for browser=${browser} featureKey=${featureKey}`);
    return undefined;
  }

  // Transform S3 HTTP header names into the same metadata keys as test_logs_controller.rb returns
  const metadata = Object.fromEntries(
    Array.from(res.headers.entries(), ([httpHeader, v]) => [s3HeaderToMetadataKey(httpHeader), v])
  );
  metadata.key = s3Key;

  return metadata;
}

// Iterate through `tests`, and fetch metadata for each test directly from S3.
// This function works without a backend, its a fallback in particular to serve
// our HTML off a static bucket.
async function fetchMetadataDirectlyFromS3() {
  // Fetch all test results from S3 in parallel, start them going:
  const entries = Object.entries(tests).flatMap(([browser, features]) =>
    Object.keys(features).map(featureKey =>
      fetchMetadataDirectlyFromS3For(browser, featureKey)
    )
  );

  // Now wait for all the parallel fetch() calls to complete, this returns the
  // same format as `test_logs_controller.rb`, and allows to operate "backendless".
  return (await Promise.all(entries)).filter(Boolean);
}

// Fetches test status (pass, fail, etc) from S3 metadata by proxying our call through
// test_logs_controller.rb. We now support `fetchMetadataDirectlyFromS3`, but this is slower
// because the browser more heavily restricts the number or parallel requests to
// the same domain. As a result, we prefer this method.
async function fetchMetadataFromDashboardAPI(since) {
  const res = await fetch(`${API_BASEPATH}/${S3_PREFIX}/since/${since}`, {
    mode: "no-cors",
  });
  if (res.ok) {
    return res.json();
  } else {
    throw new Error(`HTTP ${res.status}`);
  }
}

// Try to fetch S3 metadata for _output.html files (which contains test status like pass/fail)
//
// First we try to fetch it via `test_logs_controller.rb`, this will work when dashboard is running
// in situations like the test server, or your local dev box.
//
// If this fails, we fallback to fetching the S3 metadata directly. This is a little slower,
// but allows us to support a static-html-only mode, that allows uploading this file to S3, giving
// us a permalink we can pass back in drone.
async function fetchMetadata(since) {
  try {
    // Try to fetch from test_logs_controller.rb first:
    return await fetchMetadataFromDashboardAPI(since)
  } catch (error) {
    // Looks like test_logs_controller.rb wasn't there, we're probably running as static HMTML uploaded to S3
    console.warn(`Failed to fetch metadata from dashboard API, falling back to trying direct S3 access (original error: ${error})`);

    // Maybe this file is hosted on a static S3 bucket? Or dashboard isn't running?
    // Lets try accessing S3 directly. The bucket IS public after all.

    // However, first we disable auto-refresh, because unlike S3 we can't do
    // a one-op list that includes the last_modified metadata, so loading this
    // every 10s would be doing hundreds of HTTP GET calls over and over.
    disableAutoRefresh();

    return await fetchMetadataDirectlyFromS3()
  }
}

async function refresh() {
  // Fetches all logs for this branch and maps them to the tests in this run.
  // Passes last modification times to the test objects so they can decide
  // whether to update.
  if (refreshButton.disabled) {
    return;
  }
  refreshButton.disabled = true;
  let lastRefreshEpochSeconds = Math.floor(lastRefreshTime.getTime() / 1000);
  let newTime = new Date();
  
  try {
    const json = await fetchMetadata(lastRefreshEpochSeconds);

    try {
      for (object of json) {
        await refreshIndividualTest(object)
      }
      lastRefreshTime = newTime;
      lastRefreshTimeLabel.textContent = "Updated " + lastRefreshTime.toTimeString();
    } catch (error) {
      lastRefreshTimeLabel.textContent = "Partially updated at " + newTime.toTimeString();
      console.warn(error);
    }
  } finally {
    refreshButton.disabled = false;
  }
}

/**
 * @param {object} object
 * @returns {Promise}
 */
function refreshIndividualTest(object) {
  const test = testFromS3Key(object.key);
  if (test) {
    return test.setLastModified(object, new Date(object.last_modified));
  }
  // If we can't find the test, we don't care about it.
  console.warn(`refreshIndividualTest(): skipping test for ${object.key} because none could be found, object=`, object);
  return Promise.resolve();
}

var refreshInterval = null;
function enableAutoRefresh() {
  refreshButton.style.display = "none";
  autoRefreshButton.textContent = "Disable Auto-Refresh";
  refreshInterval = setInterval(refresh, 10000); // 10 seconds
}

function disableAutoRefresh() {
  refreshButton.style.display = "inline-block";
  autoRefreshButton.textContent = "Enable Auto-Refresh";
  clearInterval(refreshInterval);
  refreshInterval = null;
}

function toggleAutoRefresh() {
  if (refreshInterval) {
    disableAutoRefresh();
  } else {
    enableAutoRefresh();
  }
}
refreshButton.onclick = refresh;
autoRefreshButton.onclick = toggleAutoRefresh;
updateProgressNow();
enableAutoRefresh();
refresh();

let hideSucceeded = false;
function toggleHideSucceeded() {
  hideSucceeded = !hideSucceeded;
  hideSucceededButton.textContent = `${
    hideSucceeded ? "Show" : "Hide"
  } Succeeded`;
  let sheet = document.styleSheets[document.styleSheets.length - 1];
  let display = hideSucceeded ? "none" : "table-row";
  let rule = _.findLast(
    sheet.rules,
    (rule) => rule.selectorText === ".SUCCEEDED"
  );
  if (rule) {
    rule.style.display = display;
  } else {
    sheet.insertRule(`.SUCCEEDED{display: ${display}}`, sheet.cssRules.length);
  }
}
let hideSucceededButton = document.querySelector("#hide-succeeded-button");
hideSucceededButton.onclick = toggleHideSucceeded;

// Help text
const helpLink = document.querySelector("#help-link");
const helpText = document.querySelector("#help-text");
function toggleHelpText() {
  if (getComputedStyle(helpText).display === "none") {
    helpText.style.display = "block";
  } else {
    helpText.style.display = "none";
  }
}
helpLink.onclick = toggleHelpText;

/**
 * Changes the icon in your browser tab (replacing the favicon)
 * to a dynamically-generated status icon of the given color
 * and progress info.
 * @param {string} [typeOrColor] Any valid HTML color string, or a
 *   status string ('pass', 'fail', 'in-progress', 'not-started').
 *   Defaults to gray (not started).
 */
function setTabStatusIcon(typeOrColor) {
  var GRAY = '#aaa';
  var BLUE = '#3A84CB';
  var GREEN = '#7FBA00';
  var RED = '#C40000';
  var DEFAULT_COLOR = GRAY;
  var STATUS_COLORS = {
    'fail': RED,
    'in-progress': BLUE,
    'not-started': GRAY,
    'pass': GREEN
  };
  var STATUS_ICONS = {
    'fail': drawX,
    'pass': drawCheckmark
  };

  var LINK_ELEMENT_ID = 'tab-status-icon-link';

  /**
   * Replace the favicon reference in the document head with a new one.
   */
  function setStatusIcon(imageUrl) {
    var head = document.getElementsByTagName('head')[0];

    var oldLink = document.getElementById(LINK_ELEMENT_ID);
    if (oldLink) {
      head.removeChild(oldLink);
    }

    var newLink = document.createElement('link');
    newLink.id = LINK_ELEMENT_ID;
    newLink.rel = 'shortcut icon';
    newLink.href = imageUrl;
    head.appendChild(newLink);
  }

  /**
   * Generates a PNG dataURL for a status icon displaying the
   * given color and progress.
   * @param {string} [typeOrColor] Any valid HTML color string, or a
   *   status string ('pass', 'fail', 'in-progress', 'not-started').
   *   Defaults to gray (not started).
   */
  function makeStatusIcon(typeOrColor) {
    if (typeof typeOrColor !== 'string') {
      typeOrColor = DEFAULT_COLOR;
    }
    var color = STATUS_COLORS.hasOwnProperty(typeOrColor) ? STATUS_COLORS[typeOrColor] : typeOrColor;

    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = 32;
    var ctx = canvas.getContext('2d');

    drawBackground(ctx, color);
    if (STATUS_ICONS.hasOwnProperty(typeOrColor)) {
      STATUS_ICONS[typeOrColor](ctx, color);
    } else {
      drawHighlight(ctx);
    }

    return canvas.toDataURL();
  }

  /**
   * Draw a bordered circular background in the given color
   * @param ctx
   * @param color
   */
  function drawBackground(ctx, color) {
    // Border
    ctx.beginPath();
    ctx.ellipse(16, 16, 16, 16, 0, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(16, 16, 14, 14, 0, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();

    // Fill
    ctx.beginPath();
    ctx.ellipse(16, 16, 13, 13, 0, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }

  /**
   * Draw a checkmark (success) icon
   * @param ctx
   * @param color
   */
  function drawCheckmark(ctx, color) {
    ctx.beginPath();
    ctx.moveTo(8, 16);
    ctx.lineTo(15, 19);
    ctx.lineTo(29, 6);
    ctx.lineTo(30, 7);
    ctx.lineTo(15, 24);
    ctx.lineTo(7, 17);
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.fill();
  }

  function drawX(ctx, color) {
    ctx.beginPath();
    ctx.moveTo(6, 7);
    ctx.lineTo(11, 7);
    ctx.lineTo(17, 15);
    ctx.lineTo(23, 7);
    ctx.lineTo(28, 7);
    ctx.lineTo(18, 16);
    ctx.lineTo(28, 25);
    ctx.lineTo(23, 25);
    ctx.lineTo(17, 17);
    ctx.lineTo(11, 25);
    ctx.lineTo(6, 25);
    ctx.lineTo(16, 16);
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.fill();
  }

  /**
   * Draw a "specular highlight."
   * Used as a default if we don't know what icon to draw.
   * @param ctx
   */
  function drawHighlight(ctx) {
    ctx.beginPath();
    ctx.ellipse(22, 10, 4, 4, 0, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
  }

  setStatusIcon(makeStatusIcon(typeOrColor));
}
