// Gather metadata for the run
var gitBranch = document.querySelector('#git-branch').textContent;
var commitHash = document.querySelector('#commit-hash').textContent;
var startTime = Date.parse(document.querySelector('#start-time').textContent);

// Build a cache of tests for this run.
var tests = {};
var rows = document.querySelectorAll('tr');
rows.forEach(row => {
  tests[row.dataset.browser] = tests[row.dataset.browser] || {};
  tests[row.dataset.browser][row.dataset.feature] = tests[row.dataset.browser][row.dataset.feature] || {};
  tests[row.dataset.browser][row.dataset.feature].row = row;
});

function refreshTestStatus()
fetch(`/test_status/${gitBranch}`, { mode: 'no-cors' }).
then(response => response.json()).
then(json => {
  json.forEach(object => {
    var lastModified = Date.parse(object.last_modified);
    if (lastModified <= startTime) { return; }

    var re = /[^/]+\\/([^_]+)_(.*)_output\.html/i;
    var result = re.exec(object.key);
    var browser = result[1];
    var feature = "features/" + result[2] + ".feature";
    if (tests[browser] && tests[browser][feature]) {
      fetch("/test_status/" + object.key, { mode: 'no-cors' }).
      then(response => response.json()).
      then(json => {
        tests[browser][feature].versionId = json.version_id;
        tests[browser][feature].commit = json.commit;
        tests[browser][feature].attempt = json.attempt;
        tests[browser][feature].success = json.success;
        tests[browser][feature].duration = json.duration;
        tests[browser][feature].row.style.backgroundColor = json.success ? "green" : "red";
        tests[browser][feature].row.querySelector('.status').textContent = JSON.stringify(json);
      });
    }
  });
});