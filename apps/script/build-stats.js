var fs = require('fs');
var path = require('path');
var readline = require('readline');
var chalk = require('chalk');

var lineReader = readline.createInterface({
  input: fs.createReadStream(path.join(__dirname, '..', 'build-times.log'))
});

var firstTime;
var lastTime;
var taskToTime = {};
var totalTime = 0;

function leftpad(str, width, char) {
  char = char || '0';
  str = str.toString();
  while (str.length < width) {
    str = char + str;
  }
  return str;
}

function formatDuration(duration) {
  var ms = duration % 1000;
  var s = Math.floor(duration / 1000) % 60;
  var m = Math.floor(duration / 1000 / 60) % 60;
  var h = Math.floor(duration / 1000 / 60 / 60) % 60;
  return [h, m, s].map(function (a) { return leftpad(a, 2); }).join(':')+'.'+leftpad(ms, 3);
}

lineReader.on('line', function (line) {
  var data = JSON.parse(line);
  var timestamp = data[0];
  var email = data[1];
  var stats = data[2];

  if (!firstTime) {
    firstTime = timestamp;
  }
  lastTime = timestamp;

  stats.forEach(function (stat) {
    var task = stat[0];
    var time = stat[1];
    if (!taskToTime[task]) {
      taskToTime[task] = 0;
    }
    taskToTime[task] += time;
    totalTime += time;
  });

});
lineReader.on('close', function () {
  var sortedTasks = [];
  for (var task in taskToTime) {
    sortedTasks.push([taskToTime[task], task]);
  }
  sortedTasks.sort(function (a, b) { return a[0] - b[0]; });
  sortedTasks.forEach(function (task) {
    console.log(formatDuration(task[0]), task[1]);
  });
  console.log("\nbetween", chalk.yellow(firstTime));
  console.log("and    ", chalk.yellow(lastTime));
  console.log("you spent", chalk.bold.underline.green(formatDuration(totalTime)), "waiting for your apps build to finish :)");
});
