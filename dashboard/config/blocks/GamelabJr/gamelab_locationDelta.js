function locationDelta(distance, direction, loc) {
  if (direction === "random") {
    var x = Math.random();
    if (x < 0.25) {
      direction = "north";
    } else if (x < 0.5) {
      direction = "south";
    } else if (x < 0.75) {
      direction = "east";
    } else {
      direction = "west";
    }
  }
  switch (direction) {
    case "north":
      return {x: loc.x, y: loc.y + distance};
    case "south":
      return {x: loc.x, y: loc.y - distance};
    case "east":
      return {x: loc.x + distance, y: loc.y};
    case "west":
      return {x: loc.x - distance, y: loc.y};
  }
}