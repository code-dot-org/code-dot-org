function spritesWhere(property, value) {
	var group = createGroup();
	for (var i=0; i < sprites.length; i++) {
		var sprite = sprites[i];
        var spriteVal = sprite[property];
        if (property == "scale") {
            spriteVal = sprite.getScale() * 100;
        }
        if (spriteVal == value) {
			group.add(sprite);
		}
	}
	return group;
}