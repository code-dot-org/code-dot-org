function randomLocationWithinSelectedRange(range) {
  console.log(function() {
    return {
      x: math_random_int(range.x1, range.x2),
      y: 400 - math_random_int(range.y1, range.y2)
    };
  });
  return function() {
    return {
      x: math_random_int(range.x1, range.x2),
      y: 400 - math_random_int(range.y1, range.y2)
    };
  };
}