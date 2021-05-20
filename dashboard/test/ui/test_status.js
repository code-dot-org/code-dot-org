// Scripts that operate the test status page.  We expect the page to be
// prepopulated with tables listing all of the tests we are going to run
// (see runner.rb and test_status.haml for how this happens) but the actual
// status of those tests we retrieve asynchronously from a server API
// (see test_logs_controller.rb) which in turn gets its information from the
// uploaded S3 logs and their metadata.

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

Test.prototype.setLastModified = function(object, lastModified) {
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

Test.prototype.fetchStatus = function(object) {
  this.isUpdating_ = true;
  this.updateView();
  const ensure = () => {
    this.isUpdating_ = false;
    this.updateView();
  };

  return Promise.resolve(object)
    .then(json => {
      if (json.commit === COMMIT_HASH) {
        this.versionId = json.version_id;
        this.attempt = parseInt(json.attempt, 10);
        this.success = json.success === "true";
        this.duration = parseInt(json.duration, 10);
        this.status = this.success ? STATUS_SUCCEEDED : STATUS_FAILED;
      }
    })
    .then(ensure, error => {
      ensure();
      throw error;
    });
};

Test.prototype.updateView = function() {
  const succeeded = this.status === STATUS_SUCCEEDED;
  const failed = this.status === STATUS_FAILED;

  // Get references to row elements
  let row = this.row;
  let statusCell = row.querySelector(".status");
  let logLinkCell = row.querySelector(".log-link");

  // Update row appearance
  row.className = this.status;
  if (succeeded || failed) {
    statusCell.innerHTML =
      (succeeded ? "Succeeded" : "Failed") +
      ` in ${Math.round(this.duration)} seconds` +
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

Test.prototype.s3Key = function() {
  const featureRegex = /features\/(.*)\.feature/i;
  const result = featureRegex.exec(this.feature);
  const featureName = result[1].replace(/\//g, "_");
  return `${S3_PREFIX}/${this.browser}_${featureName}${S3_KEY_SUFFIX}`;
};

Test.prototype.publicLogUrl = function() {
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
rows.forEach(row => {
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
    pendingCount
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
    pendingCount
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

function refresh() {
  // Fetches all logs for this branch and maps them to the tests in this run.
  // Passes last modification times to the test objects so they can decide
  // whether to update.
  if (refreshButton.disabled) {
    return;
  }
  refreshButton.disabled = true;
  const ensure = () => {
    refreshButton.disabled = false;
  };
  let lastRefreshEpochSeconds = Math.floor(lastRefreshTime.getTime() / 1000);
  let newTime = new Date();
  fetch(`${API_BASEPATH}/${S3_PREFIX}/since/${lastRefreshEpochSeconds}`, {
    mode: "no-cors"
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(
        `While fetching updates, "${response.url}" returned ${response.status}.`
      );
    })
    .then(json => {
      return Promise.all(json.map(object => refreshIndividualTest(object)))
        .then(() => {
          lastRefreshTime = newTime;
          lastRefreshTimeLabel.textContent =
            "Updated " + lastRefreshTime.toTimeString();
        })
        .catch(error => {
          lastRefreshTimeLabel.textContent =
            "Partially updated at " + newTime.toTimeString();
          console.warn(error);
        });
    })
    .catch(error => console.error(error))
    .then(ensure, ensure);
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
    rule => rule.selectorText === ".SUCCEEDED"
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
