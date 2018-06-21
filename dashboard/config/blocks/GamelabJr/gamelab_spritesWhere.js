function spritesWhere(property, value) {
	var group = createGroup();
	for (var i=0; i < sprites.length; i++) {
		var sprite = sprites[i];
		if (sprite[property] == value) {
			group.add(sprite);
		}
	}
	return group;
}