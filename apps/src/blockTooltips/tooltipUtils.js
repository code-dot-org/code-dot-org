/* global ace */
'use strict';

var _ = require('../lodash');

/**
 * @typedef {Object} parameterSlotInfo
 * @property {string} funcName
 * @property {number} currentParameterIndex
 */

var ONLY_WHITESPACE_REGEXP = /^\s*$/;
var ENDING_OF_BLOCK_COMMENT = /\*\/$/;
var START_OF_BLOCK_COMMENT = /^\/\*/;

/**
 * Returns the number of instances of character within string
 * @param {string} string
 * @param {string} character
 * @returns {number}
 */
function countNumberOfCharacter(string, character) {
  return string.split(character).length - 1;
}

function openerMatchesCloser(opener, closer) {
  var closersToOpeners = {
    '}': '{',
    ')': '(',
    ']': '['
  };
  return closersToOpeners[closer] === opener;
}

/**
 * Given an ace editor and row/column position, returns the function
 * name and index of the currently edited parameter.
 * If a parameter is not currently being filled in, returns null.
 * TODO(bjordan): Unit test once ace.require available in utility tests
 * @param editor
 * @param position
 * @returns {parameterSlotInfo|null}
 */
exports.findFunctionAndParamNumber = function (editor, position) {
  var seenCloserStack = [];
  var sameDepthPrecedingCommaCount = 0;

  var TokenIterator = ace.require("./token_iterator").TokenIterator;
  var iterator = new TokenIterator(editor.session, position.row, position.column);

  var token = iterator.getCurrentToken();

  // Special cases for first token

  if (position.column === 0) {
    // At beginning of a line. Step back one for first token.
    token = iterator.stepBackward();
  } else if (token && token.type.match(/^comment/)) {
    var isBlockComment = token.type === "comment.doc" ||
      token.value.match(START_OF_BLOCK_COMMENT);
    if (isBlockComment) {
      var tokenIsEndOfDocComment = token.value.match(ENDING_OF_BLOCK_COMMENT);
      var cursorIsEndOfToken = (token.start + token.value.length) === position.column;
      var cursorIsEndOfBlockComment = (tokenIsEndOfDocComment && cursorIsEndOfToken);
      if (!cursorIsEndOfBlockComment) {
        // Starting within a block comment
        return null;
      }
    } else {
      // Starting within a comment
      return null;
    }
  }

  while (token) {
    switch (token.type) {
      case "paren.rparen":
        var closers = token.value.split();
        for (var i = closers.length - 1; i >= 0; i--) {
          var currentCloser = closers[i];
          seenCloserStack.push(currentCloser);
        }
        break;
      case "paren.lparen":
        var openers = token.value.split();
        for (var j = openers.length - 1; j >= 0; j--) {
          var currentOpener = openers[j];

          var isBeginningOfFunctionCall =
            seenCloserStack.length === 0 && currentOpener === '(';
          if (isBeginningOfFunctionCall) {
            var funcName = iterator.stepBackward().value;
            // if we have text "foo.bar(", store "foo.bar" as fullFuncName and
            // "*.bar" as funcName:
            var fullFuncName;
            var previousToken = iterator.stepBackward();
            if (previousToken && previousToken.value === '.') {
              fullFuncName = iterator.stepBackward().value + '.' + funcName;
              funcName = '*.' + funcName;
            }

            return {
              funcName: funcName,
              fullFuncName: fullFuncName,
              currentParameterIndex: sameDepthPrecedingCommaCount
            };
          }

          var lastCloser = seenCloserStack.pop();
          if (!lastCloser || !openerMatchesCloser(currentOpener, lastCloser)) {
            return null;
          }
        }
        break;
      case "punctuation.operator":
        if (seenCloserStack.length === 0) {
          if (_.contains(token.value, ';')) {
            return null;
          }
          if (_.contains(token.value, ',')) {
            sameDepthPrecedingCommaCount += countNumberOfCharacter(token.value, ',');
          }
        }
        break;
      case "comment":
      case "comment.doc":
        break;
      case "text":
        // Whitespace or random non-identifier characters
        if (seenCloserStack.length !== 0 || token.value.match(ONLY_WHITESPACE_REGEXP)) {
          break;
        }
        return null;
      case "string":
      case "storage.type":
      case "identifier":
        /* falls through */
      default:
        if (seenCloserStack.length === 0 && sameDepthPrecedingCommaCount === 0) {
          // Something substantial between cursor and start of parameter slot
          return null;
        }
        break;
    }

    token = iterator.stepBackward();
  }

  return null;
};
