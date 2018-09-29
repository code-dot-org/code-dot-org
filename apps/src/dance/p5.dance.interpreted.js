/* eslint-disable */

// Songs
var songs = {
  macklemore: {
    url: 'https://curriculum.code.org/media/uploads/chu.mp3',
    bpm: 146,
    delay: 0.2, // Seconds to delay before calculating measures
    verse: [26.5, 118.56], // Array of timestamps in seconds where verses occur
    chorus: [92.25, 158] // Array of timestamps in seconds where choruses occur
  },
  macklemore90: {
    url: 'https://curriculum.code.org/media/uploads/hold.mp3',
    bpm: 146,
    delay: 0.0, // Seconds to delay before calculating measures
    verse: [0, 26.3], // Array of timestamps in seconds where verses occur
    chorus: [65.75] // Array of timestamps in seconds where choruses occur
  },
  hammer: {
    url: 'https://curriculum.code.org/media/uploads/touch.mp3',
    bpm: 133,
    delay: 2.32, // Seconds to delay before calculating measures
    verse: [1.5, 15.2], // Array of timestamps in seconds where verses occur
    chorus: [5.5, 22.1] // Array of timestamps in seconds where choruses occur
  },
  peas: {
    url: 'https://curriculum.code.org/media/uploads/feeling.mp3',
    bpm: 128,
    delay: 0.0, // Seconds to delay before calculating measures
    verse: [1.5, 15.2], // Array of timestamps in seconds where verses occur
    chorus: [5.5, 22.1] // Array of timestamps in seconds where choruses occur
  }
};
var song_meta = songs.hammer;

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

// Event handlers, loops, and callbacks
var inputEvents = [];
var setupCallbacks = [];

function registerSetup(callback) {
  setupCallbacks.push(callback);
}

function runUserSetup() {
  setupCallbacks.forEach(function (callback) {
    callback();
  });
}

function runUserEvents(events) {
  for (var i = 0; i < inputEvents.length; i++) {
    var eventType = inputEvents[i].type;
    var event = inputEvents[i].event;
    var param = inputEvents[i].param;
    if (events[eventType] && events[eventType][param]) {
      event();
    }
  }
}

function whenSetup(event) {
  setupCallbacks.push(event);
}

function whenSetupSong(song, event) {
  //song_meta = songs[song];
  setupCallbacks.push(event);
}

function whenKey(key, event) {
  inputEvents.push({
    type: 'p5.keyWentDown',
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
  registerSetup(function () {
    if (unit == "measures") {
      timestamp = nMeasures(timestamp);
      timestamp += song_meta.delay;
    }
    //TODO: Dance.song.addCue(0, timestamp, event);
  });
}

function everySeconds(n, unit, event) {
  registerSetup(function () {
    if (unit == "measures") n = nMeasures(n);
    if (n > 0) {
      var timestamp = song_meta.delay;
      while (timestamp < Dance.song.duration()) {
        //TODO: Dance.song.addCue(0, timestamp, event);
        timestamp += n;
      }
    }
  });
}

function everySecondsRange(n, unit, start, stop, event) {
  registerSetup(function () {
    if (unit == "measures") n = nMeasures(n);
    if (n > 0) {
      var timestamp = start;
      while (timestamp < stop) {
        //TODO: Dance.song.addCue(0, timestamp, event);
        timestamp += n;
      }
    }
  });
}

function everyVerseChorus(unit, event) {
  registerSetup(function () {
    song_meta[unit].forEach(function (timestamp) {
      //TODO: Dance.song.addCue(0, timestamp, event);
    });
  });
}
