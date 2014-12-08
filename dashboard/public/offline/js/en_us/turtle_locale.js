!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),(o.blockly||(o.blockly={})).appLocale=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module "+o+"");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){var MessageFormat = window.messageformat;MessageFormat.locale.en=function(n){return n===1?"one":"other"}
exports.blocksUsed = function(d){return "Blocks used: %1"};

exports.branches = function(d){return "branches"};

exports.catColour = function(d){return "Color"};

exports.catControl = function(d){return "Loops"};

exports.catMath = function(d){return "Math"};

exports.catProcedures = function(d){return "Functions"};

exports.catTurtle = function(d){return "Actions"};

exports.catVariables = function(d){return "Variables"};

exports.catLogic = function(d){return "Logic"};

exports.colourTooltip = function(d){return "Changes the color of the pencil."};

exports.createACircle = function(d){return "create a circle"};

exports.createSnowflakeSquare = function(d){return "create a snowflake of type square"};

exports.createSnowflakeParallelogram = function(d){return "create a snowflake of type parallelogram"};

exports.createSnowflakeLine = function(d){return "create a snowflake of type line"};

exports.createSnowflakeSpiral = function(d){return "create a snowflake of type spiral"};

exports.createSnowflakeFlower = function(d){return "create a snowflake of type flower"};

exports.createSnowflakeFractal = function(d){return "create a snowflake of type fractal"};

exports.createSnowflakeRandom = function(d){return "create a snowflake of type random"};

exports.createASnowflakeBranch = function(d){return "create a snowflake branch"};

exports.degrees = function(d){return "degrees"};

exports.depth = function(d){return "depth"};

exports.dots = function(d){return "pixels"};

exports.drawASquare = function(d){return "draw a square"};

exports.drawATriangle = function(d){return "draw a triangle"};

exports.drawACircle = function(d){return "draw a circle"};

exports.drawAFlower = function(d){return "draw a flower"};

exports.drawAHexagon = function(d){return "draw a hexagon"};

exports.drawAHouse = function(d){return "draw a house"};

exports.drawAPlanet = function(d){return "draw a planet"};

exports.drawARhombus = function(d){return "draw a rhombus"};

exports.drawARobot = function(d){return "draw a robot"};

exports.drawARocket = function(d){return "draw a rocket"};

exports.drawASnowflake = function(d){return "draw a snowflake"};

exports.drawASnowman = function(d){return "draw a snowman"};

exports.drawAStar = function(d){return "draw a star"};

exports.drawATree = function(d){return "draw a tree"};

exports.drawUpperWave = function(d){return "draw upper wave"};

exports.drawLowerWave = function(d){return "draw lower wave"};

exports.drawStamp = function(d){return "draw stamp"};

exports.heightParameter = function(d){return "height"};

exports.hideTurtle = function(d){return "hide artist"};

exports.jump = function(d){return "jump"};

exports.jumpBackward = function(d){return "jump backward by"};

exports.jumpForward = function(d){return "jump forward by"};

exports.jumpTooltip = function(d){return "Moves the artist without leaving any marks."};

exports.jumpEastTooltip = function(d){return "Moves the artist east without leaving any marks."};

exports.jumpNorthTooltip = function(d){return "Moves the artist north without leaving any marks."};

exports.jumpSouthTooltip = function(d){return "Moves the artist south without leaving any marks."};

exports.jumpWestTooltip = function(d){return "Moves the artist west without leaving any marks."};

exports.lengthFeedback = function(d){return "You got it right except for the lengths to move."};

exports.lengthParameter = function(d){return "length"};

exports.loopVariable = function(d){return "counter"};

exports.moveBackward = function(d){return "move backward by"};

exports.moveEastTooltip = function(d){return "Moves the artist east."};

exports.moveForward = function(d){return "move forward by"};

exports.moveForwardTooltip = function(d){return "Moves the artist forward."};

exports.moveNorthTooltip = function(d){return "Moves the artist north."};

exports.moveSouthTooltip = function(d){return "Moves the artist south."};

exports.moveWestTooltip = function(d){return "Moves the artist west."};

exports.moveTooltip = function(d){return "Moves the artist forward or backward by the specified amount."};

exports.notBlackColour = function(d){return "You need to set a color other than black for this puzzle."};

exports.numBlocksNeeded = function(d){return "This puzzle can be solved with %1 blocks.  You used %2."};

exports.penDown = function(d){return "pencil down"};

exports.penTooltip = function(d){return "Lifts or lowers the pencil, to start or stop drawing."};

exports.penUp = function(d){return "pencil up"};

exports.reinfFeedbackMsg = function(d){return "Here is your drawing! Keep working on it or continue to the next puzzle."};

exports.setColour = function(d){return "set color"};

exports.setPattern = function(d){return "set pattern"};

exports.setWidth = function(d){return "set width"};

exports.shareDrawing = function(d){return "Share your drawing:"};

exports.showMe = function(d){return "Show me"};

exports.showTurtle = function(d){return "show artist"};

exports.sizeParameter = function(d){return "size"};

exports.step = function(d){return "step"};

exports.tooFewColours = function(d){return "You need to use at least %1 different colors for this puzzle.  You used only %2."};

exports.turnLeft = function(d){return "turn left by"};

exports.turnRight = function(d){return "turn right by"};

exports.turnRightTooltip = function(d){return "Turns the artist right by the specified angle."};

exports.turnTooltip = function(d){return "Turns the artist left or right by the specified number of degrees."};

exports.turtleVisibilityTooltip = function(d){return "Makes the artist visible or invisible."};

exports.widthTooltip = function(d){return "Changes the width of the pencil."};

exports.wrongColour = function(d){return "Your picture is the wrong color.  For this puzzle, it needs to be %1."};

},{"messageformat":"messageformat"}]},{},[1])(1)});