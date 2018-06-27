function locationConstant(direction) {
  switch (direction) {
    case "north":
      return {x: 0, y: -Infinity};
    case "south":
      return {x: 0, y: Infinity};
    case "east":
      return {x: Infinity, y: 0};
    case "west":
      return {x: -Infinity, y: 0};
  }
}