function doMoveEachLR(group, move, dir) {
    if (typeof(group) == "string") {
      group = sprites_by_type[group];
    }
	group.forEach(function(sprite) { doMoveLR(sprite, move, dir);});
}