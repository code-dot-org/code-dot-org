function layoutSprites(group, format) {
    if (typeof(group) == "string") {
      group = sprites_by_type[group];
      if (!group) return;
    }
    var count = group.length;
    var sprite, i, j;
    if (format == "grid") {
      var cols = Math.ceil(Math.sqrt(count));
      var rows = Math.ceil(count / cols);
      var current = 0;
      for (i=0; i<rows; i++) {
        if (count - current >= cols) {
          for (j=0; j<cols; j++) {
            sprite = group[current];
            sprite.x = (j+1) * (400 / (cols + 1));
            sprite.y = (i+1) * (400 / (rows + 1));
            current++;
          }
        } else {
          var remainder = count - current;
          for (j=0; j<remainder; j++) {
            sprite = group[current];
            sprite.x = (j+1) * (400 / (remainder + 1));
            sprite.y = (i+1) * (400 / (rows + 1));
            current++;
          }
        }
      }
    } else if (format == "row") {
      for (i=0; i<count; i++) {
        sprite = group[i];
        sprite.x = (i+1) * (400 / (count + 1));
        sprite.y = 200;
      }
    } else {
      for (i=0; i<count; i++) {
        sprite = group[i];
        sprite.x = 200;
        sprite.y = (i+1) * (400 / (count + 1));
      }
    }
}