!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),(o.blockly||(o.blockly={})).locale=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module "+o+"");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){var MessageFormat = window.messageformat;MessageFormat.locale.en=function(n){return n===1?"one":"other"}
exports.and = function(d){return "and"};

exports.booleanTrue = function(d){return "true"};

exports.booleanFalse = function(d){return "false"};

exports.blocklyMessage = function(d){return "Blockly"};

exports.catActions = function(d){return "Actions"};

exports.catColour = function(d){return "Color"};

exports.catLogic = function(d){return "Logic"};

exports.catLists = function(d){return "Lists"};

exports.catLoops = function(d){return "Loops"};

exports.catMath = function(d){return "Math"};

exports.catProcedures = function(d){return "Functions"};

exports.catText = function(d){return "Text"};

exports.catVariables = function(d){return "Variables"};

exports.codeTooltip = function(d){return "See generated JavaScript code."};

exports.continue = function(d){return "Continue"};

exports.dialogCancel = function(d){return "Cancel"};

exports.dialogOK = function(d){return "OK"};

exports.directionNorthLetter = function(d){return "N"};

exports.directionSouthLetter = function(d){return "S"};

exports.directionEastLetter = function(d){return "E"};

exports.directionWestLetter = function(d){return "W"};

exports.end = function(d){return "end"};

exports.emptyBlocksErrorMsg = function(d){return "The \"Repeat\" or \"If\" block needs to have other blocks inside it to work. Make sure the inner block fits properly inside the containing block."};

exports.emptyFunctionBlocksErrorMsg = function(d){return "The function block needs to have other blocks inside it to work."};

exports.errorEmptyFunctionBlockModal = function(d){return "There need to be blocks inside your function definition. Click \"edit\" and drag blocks inside the green block."};

exports.errorIncompleteBlockInFunction = function(d){return "Click \"edit\" to make sure you don't have any blocks missing inside your function definition."};

exports.errorParamInputUnattached = function(d){return "Remember to attach a block to each parameter input on the function block in your workspace."};

exports.errorUnusedParam = function(d){return "You added a parameter block, but didn't use it in the definition. Make sure to use your parameter by clicking \"edit\" and placing the parameter block inside the green block."};

exports.errorRequiredParamsMissing = function(d){return "Create a parameter for your function by clicking \"edit\" and adding the necessary parameters. Drag the new parameter blocks into your function definition."};

exports.errorUnusedFunction = function(d){return "You created a function, but never used it on your workspace! Click on \"Functions\" in the toolbox and make sure you use it in your program."};

exports.errorQuestionMarksInNumberField = function(d){return "Try replacing \"???\" with a value."};

exports.extraTopBlocks = function(d){return "You have unattached blocks. Did you mean to attach these to the \"when run\" block?"};

exports.finalStage = function(d){return "Congratulations! You have completed the final stage."};

exports.finalStageTrophies = function(d){return "Congratulations! You have completed the final stage and won "+p(d,"numTrophies",0,"en",{"one":"a trophy","other":n(d,"numTrophies")+" trophies"})+"."};

exports.finish = function(d){return "Finish"};

exports.generatedCodeInfo = function(d){return "Even top universities teach block-based coding (e.g., "+v(d,"berkeleyLink")+", "+v(d,"harvardLink")+"). But under the hood, the blocks you have assembled can also be shown in JavaScript, the world's most widely used coding language:"};

exports.hashError = function(d){return "Sorry, '%1' doesn't correspond with any saved program."};

exports.help = function(d){return "Help"};

exports.hintTitle = function(d){return "Hint:"};

exports.jump = function(d){return "jump"};

exports.levelIncompleteError = function(d){return "You are using all of the necessary types of blocks but not in the right way."};

exports.listVariable = function(d){return "list"};

exports.makeYourOwnFlappy = function(d){return "Make Your Own Flappy Game"};

exports.missingBlocksErrorMsg = function(d){return "Try one or more of the blocks below to solve this puzzle."};

exports.nextLevel = function(d){return "Congratulations! You completed Puzzle "+v(d,"puzzleNumber")+"."};

exports.nextLevelTrophies = function(d){return "Congratulations! You completed Puzzle "+v(d,"puzzleNumber")+" and won "+p(d,"numTrophies",0,"en",{"one":"a trophy","other":n(d,"numTrophies")+" trophies"})+"."};

exports.nextStage = function(d){return "Congratulations! You completed "+v(d,"stageName")+"."};

exports.nextStageTrophies = function(d){return "Congratulations! You completed "+v(d,"stageName")+" and won "+p(d,"numTrophies",0,"en",{"one":"a trophy","other":n(d,"numTrophies")+" trophies"})+"."};

exports.numBlocksNeeded = function(d){return "Congratulations! You completed Puzzle "+v(d,"puzzleNumber")+". (However, you could have used only "+p(d,"numBlocks",0,"en",{"one":"1 block","other":n(d,"numBlocks")+" blocks"})+".)"};

exports.numLinesOfCodeWritten = function(d){return "You just wrote "+p(d,"numLines",0,"en",{"one":"1 line","other":n(d,"numLines")+" lines"})+" of code!"};

exports.play = function(d){return "play"};

exports.print = function(d){return "Print"};

exports.puzzleTitle = function(d){return "Puzzle "+v(d,"puzzle_number")+" of "+v(d,"stage_total")};

exports.repeat = function(d){return "repeat"};

exports.resetProgram = function(d){return "Reset"};

exports.runProgram = function(d){return "Run"};

exports.runTooltip = function(d){return "Run the program defined by the blocks in the workspace."};

exports.score = function(d){return "score"};

exports.showCodeHeader = function(d){return "Show Code"};

exports.showBlocksHeader = function(d){return "Show Blocks"};

exports.showGeneratedCode = function(d){return "Show code"};

exports.stringEquals = function(d){return "string=?"};

exports.subtitle = function(d){return "a visual programming environment"};

exports.textVariable = function(d){return "text"};

exports.tooFewBlocksMsg = function(d){return "You are using all of the necessary types of blocks, but try using more  of these types of blocks to complete this puzzle."};

exports.tooManyBlocksMsg = function(d){return "This puzzle can be solved with <x id='START_SPAN'/><x id='END_SPAN'/> blocks."};

exports.tooMuchWork = function(d){return "You made me do a lot of work!  Could you try repeating fewer times?"};

exports.toolboxHeader = function(d){return "Blocks"};

exports.openWorkspace = function(d){return "How It Works"};

exports.totalNumLinesOfCodeWritten = function(d){return "All-time total: "+p(d,"numLines",0,"en",{"one":"1 line","other":n(d,"numLines")+" lines"})+" of code."};

exports.tryAgain = function(d){return "Try again"};

exports.hintRequest = function(d){return "See hint"};

exports.backToPreviousLevel = function(d){return "Back to previous level"};

exports.saveToGallery = function(d){return "Save to gallery"};

exports.savedToGallery = function(d){return "Saved in gallery!"};

exports.shareFailure = function(d){return "Sorry, we can't share this program."};

exports.typeFuncs = function(d){return "Available functions:%1"};

exports.typeHint = function(d){return "Note that the parentheses and semicolons are required."};

exports.workspaceHeader = function(d){return "Assemble your blocks here: "};

exports.workspaceHeaderJavaScript = function(d){return "Type your JavaScript code here"};

exports.infinity = function(d){return "Infinity"};

exports.rotateText = function(d){return "Rotate your device."};

exports.orientationLock = function(d){return "Turn off orientation lock in device settings."};

exports.wantToLearn = function(d){return "Want to learn to code?"};

exports.watchVideo = function(d){return "Watch the Video"};

exports.when = function(d){return "when"};

exports.whenRun = function(d){return "when run"};

exports.tryHOC = function(d){return "Try the Hour of Code"};

exports.signup = function(d){return "Sign up for the intro course"};

exports.hintHeader = function(d){return "Here's a tip:"};

exports.genericFeedback = function(d){return "See how you ended up, and try to fix your program."};

exports.defaultTwitterText = function(d){return "Check out what I made"};

},{"messageformat":"messageformat"}]},{},[1])(1)});