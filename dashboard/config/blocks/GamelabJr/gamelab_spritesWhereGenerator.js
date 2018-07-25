function spritesWhereGenerator(property, op, value) {
  function generator(property, op, value) {
	var group = createGroup();

    if (property == "scale") { value/=100; }
	for (var i=0; i < sprites.length; i++) {
		var sprite = sprites[i];
      	if (op == '=' && sprite[property] == value) {
          group.add(sprite);
        } else if (op == '>' && sprite[property] > value) {
          group.add(sprite);
        } else if (op == '<' && sprite[property] < value) {
          group.add(sprite);
        }
	}
    return group;
  }
	return generator;
}