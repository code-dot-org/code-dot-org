var lines = [];

function randomWord() {
  return "cat";
}

function addLine(line) {
  lines.push(line);
}

function showPoem() {
  for (var i = 0; i < lines.length; i++) {
    printText(lines[i]);
  }
}