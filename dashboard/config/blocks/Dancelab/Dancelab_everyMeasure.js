function everyMeasure(n, event) {
  registerSetup(function() {
 	Dance.song.addCue(0, timestamp, event);
  });
}