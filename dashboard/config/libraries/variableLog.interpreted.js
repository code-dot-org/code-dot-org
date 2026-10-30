/* This file is only executed within JSInterpreter */
/* This library supports validation of Sprite Lab projects that use variables.*/

// varLog must be declared at the global scope because validation code in existing levels reference it directly.
// It should be given a value from buildVariableLog(), which is a native Sprite Lab command that returns an object
// with properties representing student Blockly variables. varLog is also accessed and updated in the functions below.
var varLog;
var previousVarLog;


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
  varLog = buildVariableLog();
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