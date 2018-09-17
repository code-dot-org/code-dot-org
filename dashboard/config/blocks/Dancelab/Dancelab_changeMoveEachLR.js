function changeMoveEachLR(group, move, dir) {
    if (typeof(group) == "string") {
      group = sprites_by_type[group];
    }
	group.forEach(function(sprite) { changeMoveLR(sprite, move, dir);});
}