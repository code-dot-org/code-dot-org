function randomLocationWithinRange(x1, x2, y1, y2) {
  return function() {
    return {
      x: math_random_int(x1, x2),
      y: 400 - math_random_int(y1, y2)
    };
  };
}