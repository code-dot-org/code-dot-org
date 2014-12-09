!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),(o.blockly||(o.blockly={})).appLocale=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module "+o+"");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){var MessageFormat = window.messageformat;MessageFormat.locale.en=function(n){return n===1?"one":"other"}
exports.atHoneycomb = function(d){return "at honeycomb"};

exports.atFlower = function(d){return "at flower"};

exports.avoidCowAndRemove = function(d){return "avoid the cow and remove 1"};

exports.continue = function(d){return "Continue"};

exports.dig = function(d){return "remove 1"};

exports.digTooltip = function(d){return "remove 1 unit of dirt"};

exports.dirE = function(d){return "E"};

exports.dirN = function(d){return "N"};

exports.dirS = function(d){return "S"};

exports.dirW = function(d){return "W"};

exports.doCode = function(d){return "do"};

exports.elseCode = function(d){return "else"};

exports.fill = function(d){return "fill 1"};

exports.fillN = function(d){return "fill "+v(d,"shovelfuls")};

exports.fillStack = function(d){return "fill stack of "+v(d,"shovelfuls")+" holes"};

exports.fillSquare = function(d){return "fill square"};

exports.fillTooltip = function(d){return "place 1 unit of dirt"};

exports.finalLevel = function(d){return "Congratulations! You have solved the final puzzle."};

exports.flowerEmptyError = function(d){return "The flower you're on has no more nectar."};

exports.get = function(d){return "get"};

exports.heightParameter = function(d){return "height"};

exports.holePresent = function(d){return "there is a hole"};

exports.honey = function(d){return "make honey"};

exports.honeyAvailable = function(d){return "honey"};

exports.honeyTooltip = function(d){return "Make honey from nectar"};

exports.honeycombFullError = function(d){return "This honeycomb does not have room for more honey."};

exports.ifCode = function(d){return "if"};

exports.ifInRepeatError = function(d){return "You need an \"if\" block inside a \"repeat\" block. If you're having trouble, try the previous level again to see how it worked."};

exports.ifPathAhead = function(d){return "if path ahead"};

exports.ifTooltip = function(d){return "If there is a path in the specified direction, then do some actions."};

exports.ifelseTooltip = function(d){return "If there is a path in the specified direction, then do the first block of actions. Otherwise, do the second block of actions."};

exports.ifFlowerTooltip = function(d){return "If there is a flower/honeycomb in the specified direction, then do some actions."};

exports.ifelseFlowerTooltip = function(d){return "If there is a flower/honeycomb in the specified direction, then do the first block of actions. Otherwise, do the second block of actions."};

exports.insufficientHoney = function(d){return "You're using all the right blocks, but you need to make the right amount of honey."};

exports.insufficientNectar = function(d){return "You're using all the right blocks, but you need to collect the right amount of nectar."};

exports.make = function(d){return "make"};

exports.moveBackward = function(d){return "move backward"};

exports.moveEastTooltip = function(d){return "Move me east one space."};

exports.moveForward = function(d){return "move forward"};

exports.moveForwardTooltip = function(d){return "Move me forward one space."};

exports.moveNorthTooltip = function(d){return "Move me north one space."};

exports.moveSouthTooltip = function(d){return "Move me south one space."};

exports.moveTooltip = function(d){return "Move me forward/backward one space"};

exports.moveWestTooltip = function(d){return "Move me west one space."};

exports.nectar = function(d){return "get nectar"};

exports.nectarRemaining = function(d){return "nectar"};

exports.nectarTooltip = function(d){return "Get nectar from a flower"};

exports.nextLevel = function(d){return "Congratulations! You have completed this puzzle."};

exports.no = function(d){return "No"};

exports.noPathAhead = function(d){return "path is blocked"};

exports.noPathLeft = function(d){return "no path to the left"};

exports.noPathRight = function(d){return "no path to the right"};

exports.notAtFlowerError = function(d){return "You can only get nectar from a flower."};

exports.notAtHoneycombError = function(d){return "You can only make honey at a honeycomb."};

exports.numBlocksNeeded = function(d){return "This puzzle can be solved with %1 blocks."};

exports.pathAhead = function(d){return "path ahead"};

exports.pathLeft = function(d){return "if path to the left"};

exports.pathRight = function(d){return "if path to the right"};

exports.pilePresent = function(d){return "there is a pile"};

exports.putdownTower = function(d){return "put down tower"};

exports.removeAndAvoidTheCow = function(d){return "remove 1 and avoid the cow"};

exports.removeN = function(d){return "remove "+v(d,"shovelfuls")};

exports.removePile = function(d){return "remove pile"};

exports.removeStack = function(d){return "remove stack of "+v(d,"shovelfuls")+" piles"};

exports.removeSquare = function(d){return "remove square"};

exports.repeatCarefullyError = function(d){return "To solve this, think carefully about the pattern of two moves and one turn to put in the \"repeat\" block.  It's okay to have an extra turn at the end."};

exports.repeatUntil = function(d){return "repeat until"};

exports.repeatUntilBlocked = function(d){return "while path ahead"};

exports.repeatUntilFinish = function(d){return "repeat until finish"};

exports.step = function(d){return "Step"};

exports.totalHoney = function(d){return "total honey"};

exports.totalNectar = function(d){return "total nectar"};

exports.turnLeft = function(d){return "turn left"};

exports.turnRight = function(d){return "turn right"};

exports.turnTooltip = function(d){return "Turns me left or right by 90 degrees."};

exports.uncheckedCloudError = function(d){return "Make sure to check all clouds to see if they're flowers or honeycombs."};

exports.uncheckedPurpleError = function(d){return "Make sure to check all purple flowers to see if they have nectar"};

exports.whileMsg = function(d){return "while"};

exports.whileTooltip = function(d){return "Repeat the enclosed actions until finish point is reached."};

exports.word = function(d){return "Find the word"};

exports.yes = function(d){return "Yes"};

exports.youSpelled = function(d){return "You spelled"};

},{"messageformat":"messageformat"}]},{},[1])(1)});