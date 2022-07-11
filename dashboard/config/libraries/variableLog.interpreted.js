/* This file is only executed within JSInterpreter */
/* This library supports validation of Sprite Lab projects that use variables.*/

var studentVarToken = false;
var previousVarLog;

// Create an array of objects representing within the variables that have been
// declared or updated within the Blockly environment. All Blockly variables
// are global, and we would like to find a more efficient way to find just
// those used by the student.
function buildVariableLog() {
  var varLog = {};
  var windowKeys = Object.keys(window);
  var start = windowKeys.indexOf("studentVarToken") + 1;
  var end = windowKeys.length;
  var index;
  for (var i = start; i < end; i++) {
    var currentKey = windowKeys[i];
    var currentValue = window[currentKey];
    // Blockly functions and behaviors should be excluded.
    var valueTypes = ["number", "string", "boolean"];
    // ES5 doesn't support .includes or we'd use that here.
    if (valueTypes.indexOf(typeof currentValue) > -1) {
      varLog[windowKeys[i]] = currentValue;
    }
  }
  return varLog;
}

// Returns true if any student-created variable was updated.
// This function can run multiple times per frame.
function detectVariableLogChange() {
  var result = false;
  if (varLog && previousVarLog) {
    for (var property in varLog) {
      if (varLog[property] !== previousVarLog[property]) {
        result = true;
      }
    }
  }
  return result;
}

// Replaces check() found in ValidationSetup interpreted library.
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

// Updates the variable log. This function should run once per frame.
function updateVariableLog() {
  if (varLog) {
    for (var property in varLog) {
      varLog[property] = window[property];
    }
  }
}

// Perform a deep copy for comparisons during the next frame.
function storeVariableLogforPrevious() {
  previousVarLog = JSON.parse(JSON.stringify(varLog));
}

// Returns true if the student has a variable label that starts with "_"
// This can be used to check that students have renamed their variables
// from the default "???" by adding !varLabelStartsWithUnderscore()
// as a validation criterion.
function varLabelStartsWithUnderscore() {
  var result = false;
  Object.keys(varLog).forEach(function (label,index) {
    if (label.charAt(0) === "_") {
      result = true;
    }
  });
  return result;
}