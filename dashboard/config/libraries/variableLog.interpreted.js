var studentVarToken = false;
var previousVarLog;

// Create an array of objects representing within the variables that have been
// declared or updated within the Blockly environment. All Blockly variables
// are global, and we would like to find a more efficient way to find just
// those used by the student.
function buildVariableLog() {
  text("Building variable log...",0,15);
  var varLog = {};
  var start = Object.keys(window).indexOf("studentVarToken") + 1;
  var end = Object.keys(window).length;
  var index;
  for (var i = start; i < end; i++) {
    // Blockly functions and behaviors should be excluded. 
    if (
      typeof window[Object.keys(window)[i]] == "number" ||
      typeof window[Object.keys(window)[i]] == "string" ||
      typeof window[Object.keys(window)[i]] == "boolean"
    ) {
      varLog[Object.keys(window)[i]] = window[Object.keys(window)[i]];
    }
  }
  return varLog;
}

function detectVariableLogChange() {
  var result = false;
  if(varLog && previousVarLog){
    for (var property in varLog) {
      if (varLog[property] !== previousVarLog[property]) {
        //window[Object.keys(window)[Object.keys(window).indexOf(property)]]
        result = true;
      }
    }
  }
  return result;
}

function updateVariableLog() {
  for (var property in varLog) {
    if (varLog[property] !== window[Object.keys(window)[Object.keys(window).indexOf(property)]]) {
      varLog[property] = window[Object.keys(window)[Object.keys(window).indexOf(property)]];
    }
  }
}

function storeVariableLogforPrevious() {
  previousVarLog = JSON.parse(JSON.stringify(varLog));
}


// Draw a set of on-screen watchers, ie. show each student variable name
// and it's value, in a drawn element on the canvas. (Prototype)
function varWatchers(varLog) {
  for (var key in varLog) {
    var index = Object.keys(varLog).indexOf(key);
    var x = 5;
    var y = 32;
    drawWatcher(key, varLog[key], iqndex, x, y);
  }
}

function drawWatcher(label, value, index, x, y) {
  if (!value && value != 0 && value != "") {
    value = "undefined";
  }
  var fontSize = 15;
  textSize(fontSize);
  textAlign(LEFT, CENTER);
  var labelX = x + 5;
  var valueX = x + 15 + textWidth(label);
  var textY = y + (index + 0.5) * fontSize * 2;
  stroke("#c6cacd");
  fill("#e7e8ea");
  rect(
    x,
    y + index * fontSize * 2,
    textWidth(label) + textWidth(value) + 25,
    fontSize * 2,
    fontSize / 2
  );
  noStroke();
  fill("#5b6770");
  text(label, labelX, textY);
  fill("#ffa400");
  rect(
    valueX - 5,
    y + (index + 0.125) * fontSize * 2,
    textWidth(value) + 10,
    fontSize * 1.5,
    fontSize / 1.5
  );
  noStroke();
  fill("white");
  text(value, valueX, textY);
}

function check() {
  updateVariableLog();
  var results = updateValidation();
  if (results) {
    if (results.state === "failed") {
      levelFailure(3, results.feedback);
    } else if (results.state === "succeeded") {
      levelFailure(0, results.feedback);
    }
  }
  storeVariableLogforPrevious();
}