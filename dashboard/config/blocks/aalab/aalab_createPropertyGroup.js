function createPropertyGroup(group, costume) {
  for (var i=0; i < sprites.length; i++) {
		var sprite = sprites[i];
        if (sprite.getAnimationLabel() == costume) {
			sprite.addToGroup(group);
		}
	}
}