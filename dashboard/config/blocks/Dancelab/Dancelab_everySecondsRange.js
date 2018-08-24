function everySecondsRange(n, start, stop, event) {
  registerSetup(function() {
    if (unit == "measures") n = nMeasures(n);
    if (n > 0) {
      var timestamp = start;
      while (timestamp < stop) {
        Dance.song.addCue(0, timestamp, event);
        timestamp += n;
      }
    }
  });
}