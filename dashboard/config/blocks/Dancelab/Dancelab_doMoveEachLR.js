function doMoveEachLR(group, move, dir) {
    if (typeof(group) == "string") {
      if (!sprites_by_type.hasOwnProperty(group)) {
        console.log("There is no group of " + group);
        return;
      }
      group = sprites_by_type[group];
    }
	group.forEach(function(sprite) { doMoveLR(sprite, move, dir);});
}