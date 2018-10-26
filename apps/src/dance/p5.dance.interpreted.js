/* eslint-disable */

var sprites = 'all'; // compat

// Needed for block dropdown enum options.
var MOVES = {
  Rest: 0,
  ClapHigh: 1,
  Clown: 2,
  Dab: 3,
  DoubleJam: 4,
  Drop: 5,
  Floss: 6,
  Fresh: 7,
  Kick: 8,
  Roll: 9,
  ThisOrThat: 10,
  Thriller: 11
};

// Event handlers, loops, and callbacks.
var inputEvents = [];
var setupCallbacks = [];

function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function getCueList() {
  var timestamps = [];
  var measures = [];
  for (var i = 0; i < inputEvents.length; i++) {
    if (inputEvents[i].type === 'cue-seconds') {
      timestamps.push(inputEvents[i].param);
    } else if (inputEvents[i].type === 'cue-measures') {
      measures.push(inputEvents[i].param);
    }
  }
  return {
    seconds: timestamps,
    measures: measures
  };
}

function registerSetup(callback) {
  setupCallbacks.push(callback);
}

function runUserSetup() {
  setupCallbacks.forEach(function (callback) {
    callback();
  });
}

function runUserEvents(events) {
  var currentEvents = {};
  for (var i = 0; i < inputEvents.length; i++) {
    var eventType = inputEvents[i].type;
    var event = inputEvents[i].event;
    var param = inputEvents[i].param;
    var priority = inputEvents[i].priority;
    if (events[eventType] && events[eventType][param]) {
      //If there are multiple cues of the same type, only run the event with the highest priority
      if (!currentEvents[eventType] || currentEvents[eventType].priority < priority) {
        currentEvents[eventType] = {event: event, priority: priority};
      }
    }
  }
  for (var input in currentEvents){
    if(currentEvents.hasOwnProperty(input)){
      currentEvents[input].event();
    }
  }
}

function whenSetup(event) {
  setupCallbacks.push(event);
}

function whenSetupSong(song, event) {
  setupCallbacks.push(event);
}

function ifDanceIs(sprite, dance, ifStatement, elseStatement) {
  if (getCurrentDance(sprite) == Number(dance)) {
    ifStatement();
  } else {
    elseStatement();
  }
}

function whenKey(key, event) {
  inputEvents.push({
    type: 'this.p5_.keyWentDown',
    event: event,
    param: key
  });
}

function whenPeak(range, event) {
  inputEvents.push({
    type: 'Dance.fft.isPeak',
    event: event,
    param: range
  });
}

function atTimestamp(timestamp, unit, event) {
  inputEvents.push({
    type: 'cue-' + unit,
    event: event,
    param: timestamp
  });
}

function everySeconds(n, unit, event) {
  // TODO: 90 seconds is the max for songs, but 90 measures is too long
  everySecondsRange(n, unit, 0, 90, event);
}

function everySecondsRange(n, unit, start, stop, event) {
  if (n > 0) {
    var timestamp = start;
    while (timestamp < stop) {
      inputEvents.push({
        type: 'cue-' + unit,
        event: event,
        param: timestamp,
        priority: n
      });
      timestamp += n;
    }
  }
}

function everyVerseChorus(unit, event) {
  inputEvents.push({
    type: 'verseChorus',
    event: event,
    param: unit
  });
}
