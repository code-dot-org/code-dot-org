function spritesWhere(property, value) {
	var group = createGroup();
	for (var i=0; i<World.allSprites.length; i++) {
		var sprite = World.allSprites[i];
		if (sprite[property] == value) {
			group.add(sprite);
		}
	}
	return group;
}