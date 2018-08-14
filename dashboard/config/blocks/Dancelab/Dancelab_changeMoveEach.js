function changeMoveEach(group, move) {
    if (typeof(group) == "string") {
      group = sprites_by_type[group];
    }
	group.forEach(function(sprite) { changeMove(sprite, move);});
}