function everySecondsRange(n, start, stop, event) {
  registerSetup(function() {
    if (n > 0) {
      var timestamp = start;
      while (timestamp < stop) {
        Dance.song.addCue(0, timestamp, event);
        timestamp += n;
      }
    }
  });
}