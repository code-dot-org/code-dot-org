// Grab DOM references
var lastRefreshTimeLabel = document.querySelector('#last-refresh-time');
var refreshButton = document.querySelector('#refresh-button');
var autoRefreshButton = document.querySelector('#auto-refresh-button');

// Gather metadata for the run
var gitBranch = document.querySelector('#git-branch').dataset.branch;
var commitHash = document.querySelector('#commit-hash').dataset.hash;
var startTime = new Date(document.querySelector('#start-time').textContent);

var lastRefreshTime = startTime;

const GRAY = '#dddddd';
const RED = '#ff8888';
const GREEN = '#78ea78';

const STATUS_PENDING = 'PENDING';
const STATUS_FAILED = 'FAILED';
const STATUS_SUCCEEDED = 'SUCCEEDED';

function Test(fromRow) {
  /** @type {HTMLRowElement} */
  this.row = fromRow;


  /** @type {string} */
  this.browser = (typeof this.row.dataset.browser === 'string') ?
      this.row.dataset.browser : 'UnknownBrowser';

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

  /** @private {string} */
  this.status_ = STATUS_PENDING;

  /** @private {Date} */
  this.lastModified_ = null;

  /** @private {boolean} */
  this.isUpdating_ = false;

  // Do an intitial render to put everything in a consistent state.
  this.updateView();
}

Test.prototype.setLastModified = function (lastModified) {
  // Do no updating if things haven't changed.
  if (this.lastModified_ && lastModified <= this.lastModified_) {
    return;
  }

  this.lastModified_ = lastModified;
  if (lastModified > startTime && this.status_ !== STATUS_SUCCEEDED) {
    this.fetchStatus();
  } else {
    this.updateView();
  }
};

Test.prototype.fetchStatus = function () {
  this.isUpdating_ = true;
  this.updateView();
  const ensure = () => {
    this.isUpdating_ = false;
    this.updateView();
  };

  fetch("/test_status/" + this.s3Key(), {mode: 'no-cors'})
    .then(response => response.json())
    .then(json => {
      if (json.commit === commitHash) {
        this.versionId = json.version_id;
        this.attempt = parseInt(json.attempt, 10);
        this.success = json.success === 'true';
        this.duration = parseInt(json.duration, 10);
        this.status_ = this.success ? STATUS_SUCCEEDED : STATUS_FAILED;
      }
    })
    .then(ensure, ensure);
};

Test.prototype.updateView = function () {
  const succeeded = this.status_ === STATUS_SUCCEEDED;
  const failed = this.status_ === STATUS_FAILED;

  // Get references to row elements
  let row = this.row;
  let statusCell = row.querySelector('.status');
  let logLinkCell = row.querySelector('.log-link');

  // Update row appearance
  if (succeeded || failed) {
    row.style.backgroundColor = succeeded ? GREEN : RED;
    statusCell.innerHTML = (succeeded ? 'Succeeded' : 'Failed') +
        ` in ${Math.round(this.duration)} seconds` +
        (this.attempt > 0 ? ` on retry #${this.attempt}` : '');
    logLinkCell.innerHTML = `<a href="${this.publicLogUrl()}">Log on S3</a>`;
  } else {
    row.style.backgroundColor = GRAY;
    statusCell.innerHTML = '';
    logLinkCell.innerHTML = '';
  }

  if (this.isUpdating_) {
    statusCell.innerHTML += " (Updating)";
  }
};

Test.prototype.s3Key = function () {
  const featureRegex = /features\/(.*)\.feature/i;
  let result = featureRegex.exec(this.feature);
  let featureName = result[1].replace('/', '_');
  return `${gitBranch}/${this.browser}_${featureName}_output.html`;
};

Test.prototype.publicLogUrl = function () {
  return `https://cucumber-logs.s3.amazonaws.com/${this.s3Key()}?versionId=${this.versionId}`;
};

// Build a cache of tests for this run.
var tests = {};
var rows = document.querySelectorAll('tbody tr');
rows.forEach(row => {
  let test = new Test(row);
  tests[test.browser] = tests[test.browser] || {};
  tests[test.browser][test.feature] = test;
});

function testFromS3Key(key) {
  var re = /[^/]+\/([^_]+)_(.*)_output\.html/i;
  var result = re.exec(key);
  var browser = result[1]; // TODO: Handle slashes
  var feature = "features/" + result[2] + ".feature";
  if (tests[browser] && tests[browser][feature]) {
    return tests[browser][feature];
  }
  return null;
}


function refresh() {
  // Fetches all logs for this branch and maps them to the tests in this run.
  // Passes last modification times to the test objects so they can decide
  // whether to update.
  refreshButton.disabled = true;
  const ensure = () => {
    refreshButton.disabled = false;
  };
  let lastRefreshEpochSeconds = Math.floor(lastRefreshTime.getTime()/1000);
  let newTime = new Date();
  fetch(`/test_status/${gitBranch}/since/${lastRefreshEpochSeconds}`, { mode: 'no-cors' })
    .then(response => response.json())
    .then(json => {
      json.forEach(object => {
        let test = testFromS3Key(object.key);
        if (test) {
          test.setLastModified(new Date(object.last_modified));
        }
      });
      lastRefreshTime = newTime;
      lastRefreshTimeLabel.textContent = 'Updated ' + lastRefreshTime.toTimeString();
    })
    .then(ensure, ensure);
}

var refreshInterval = null;
function enableAutoRefresh() {
  refreshButton.style.display = 'none';
  autoRefreshButton.textContent = 'Disable Auto-Refresh';
  refreshInterval = setInterval(refresh, 10000); // 10 seconds
}

function disableAutoRefresh() {
  refreshButton.style.display = 'inline-block';
  autoRefreshButton.textContent = 'Enable Auto-Refresh';
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
enableAutoRefresh();
refresh();
