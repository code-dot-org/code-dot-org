function borderGPT(str) {
  //ChatGPT call with str
  //override createBorder() function
  other.push(createBorder);
}

function createBorder() {
  var colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
  noFill();
  var x;
  var y;
  for (var i = 0; i < 20; i++) {
    var c = colors[i % colors.length];
    stroke(c);
    beginShape();
    for (x = 20; x <= 380; x += random(5, 20)) {
      y = 20;
      vertex(x, y + i);
    }
    for (y = 20; y <= 380; y += random(5, 20)) {
      x = 380;
      vertex(x - i, y);
    }
    for (x = 380; x >= 20; x -= random(5, 20)) {
      y = 380;
      vertex(x, y - i);
    }
    for (y = 380; y >= 20; y -= random(5, 20)) {
      x = 20;
      vertex(x + i, y);
    }
    endShape(CLOSE);
  }
}







