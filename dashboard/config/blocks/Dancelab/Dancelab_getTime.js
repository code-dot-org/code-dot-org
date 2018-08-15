function getTime(unit) {
  if (unit == "measures") {
    return song_meta.bpm * (Dance.song.currentTime(0) / 240);
  } else {
  	return Dance.song.currentTime(0);
  }
}