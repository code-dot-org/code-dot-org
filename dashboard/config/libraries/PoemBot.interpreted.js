function poemBotDraw() {
  if (isVisible) {
    drawPoem();
  }
}

function drawPoem() {
  var outerMargin = 50;
  var defaultLineHeight = 50;
  var defaultFontSize = 25;
  var cursor = outerMargin;
  fill('black');
  noStroke();
  textSize(defaultFontSize);
  textAlign(CENTER);
  if (poem.title) {
    textSize(defaultFontSize * 2);
    text(poem.title, 200, cursor);
    textSize(defaultFontSize);
    cursor += defaultLineHeight;
  }
  if (poem.author) {
    cursor -= defaultLineHeight / 2;
    textSize(16);
    text("by: " + poem.author, 200, cursor);
    textSize(defaultFontSize);
    cursor += defaultLineHeight;
  }

  var lineHeight = (400 - cursor) / poem.lines.length;
  for (var i = 0; i < poem.lines.length; i++) {
    var line = poem.lines[i];
    var width = textWidth(line);
    textSize(Math.min(defaultFontSize, defaultFontSize * (400 - outerMargin) / width));
    text(line, 200, cursor);
    textSize(defaultFontSize);
    cursor += lineHeight;
  }
}

var poem = {
  title: undefined,
  author: undefined,
  lines: []
};
var isVisible = false;

function randomWord() {
  return "cat";
}

function addLine(line) {
  poem.lines.push(line || '');
}

function setTitle(title) {
  poem.title = title;
}

function setAuthor(author) {
  poem.author = author;
}

function showPoem() {
  isVisible = true;
}

other.push(poemBotDraw);