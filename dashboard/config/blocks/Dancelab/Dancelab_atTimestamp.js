function atTimestamp(timestamp, event) {
  registerSetup(function() {
 	Dance.song.addCue(0, timestamp, event);
  });
}