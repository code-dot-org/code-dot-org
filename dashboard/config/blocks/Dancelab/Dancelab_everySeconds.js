function everySeconds(n, unit, event) {
  registerSetup(function() {
    if (unit == "measures") n = nMeasures(n);
    if (n > 0) {
      var timestamp = song_meta.delay;
      while (timestamp < Dance.song.duration()) {
        Dance.song.addCue(0, timestamp, event);
        timestamp += n;
      }
    }
  });
}