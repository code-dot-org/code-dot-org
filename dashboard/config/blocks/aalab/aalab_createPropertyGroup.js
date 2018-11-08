function createPropertyGroup(costume) {
  var group = createGroup();
  for (var i=0; i < sprites.length; i++) {
		var sprite = sprites[i];
        if (sprite.getAnimationLabel() == costume) {
			group.add(sprite);
		}
	}
	return group;
}