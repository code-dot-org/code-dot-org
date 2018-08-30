function everyVerseChorus(unit, event) {
  registerSetup(function() {
    song_meta[unit].forEach(function(timestamp){
      Dance.song.addCue(0, timestamp, event);
    });
  });
}