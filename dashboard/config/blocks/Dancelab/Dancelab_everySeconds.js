function everySeconds(n, event) {
  registerSetup(function() {
    if (n > 0) {
      var timestamp = song_meta.delay;
      while (timestamp < Dance.song.duration()) {
        Dance.song.addCue(0, timestamp, event);
        timestamp += n;
      }
    }
  });
}