function randomColor() {
  return color('hsb(' + randomNumber(0, 359) + ', 100%, 100%)').toString();
}