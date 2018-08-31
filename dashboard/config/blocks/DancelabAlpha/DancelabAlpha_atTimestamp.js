function atTimestamp(timestamp, unit, event) {
  registerSetup(function() {
    if (unit == "measures") {
      timestamp = nMeasures(timestamp);
      timestamp += song_meta.delay;
    }
 	Dance.song.addCue(0, timestamp, event);
  });
}