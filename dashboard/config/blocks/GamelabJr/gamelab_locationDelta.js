function locationDelta(distance, direction, loc) {
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