function borderGPT(str) {
  //ChatGPT call with str
  //override createBorder() function
  other.push(createBorder);
}

function createBorder() {
  var numberOfCircles = 100;
  var minRadius = 5;
  var maxRadius = 20;
  for (var i = 0; i < numberOfCircles; i++) {
    var x = random(20, 380);
    var y = random(20, 380);
    var r = random(minRadius, maxRadius);
    var opacity = random(50, 255);
    fill(0, 0, 0, opacity);
    noStroke();
    if (x < 40 || x > 360 || y < 40 || y > 360) {
      ellipse(x, y, r);
    }
  }
}








