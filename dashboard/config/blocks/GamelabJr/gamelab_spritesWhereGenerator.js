function spritesWhereGenerator(property, op, value) {
  function generator(property, op, value) {
	var group = createGroup();

	for (var i=0; i < sprites.length; i++) {
		var sprite = sprites[i];
        var spriteVal = sprite[property];
        if (property == "scale") {
          spriteVal = sprite.getScale() * 100;
        }
      	if (op == '=' && spriteVal == value) {
          group.add(sprite);
        } else if (op == '>' && spriteVal > value) {
          group.add(sprite);
        } else if (op == '<' && spriteVal < value) {
          group.add(sprite);
        }
	}
    return group;
  }
	return generator;
}