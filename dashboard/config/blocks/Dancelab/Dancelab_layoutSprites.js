
function layoutSprites(group, format) {
  if (typeof(group) == "string") {
    if (!sprites_by_type.hasOwnProperty(group)) {
      console.log("There is no group of " + group);
      return;
    }
    group = sprites_by_type[group];
    if (!group) return;
  }
  var count = group.length;
  var sprite, i, j;
  if (format == "circle") {
    var radius =  Math.min(175, 50 + (count * 5));
    var angle = -90 * (Math.PI / 180);
    var step = (2 * Math.PI) / count;
    for (i = 0; i < count; i++) {
      sprite = group[i];
      sprite.x = 200 + radius * Math.cos(angle);
      sprite.y = 200 + radius * Math.sin(angle);
      angle += step;
    }
  } else if (format == "grid") {
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
  } else if (format == "column") {
    for (i=0; i<count; i++) {
      sprite = group[i];
      sprite.x = 200;
      sprite.y = (i+1) * (400 / (count + 1));
    }
  } else if (format == "random") {
    group.forEach(function(sprite) {
      sprite.x = randomNumber(25, 375);
      sprite.y = randomNumbeR(25, 375);
    });
  }
}