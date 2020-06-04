/**
 * # Details
 *
 * This plugin provides support for custom markdown syntax implementing [the
 * Details element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details).
 *
 * The syntax is inspired by [this proposal for generic directives in
 * CommonMark](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444).
 * In a potential future in which we want to implement these generic
 * directives, it should be a relatively simple matter to update this plugin to
 * be cross-compatible.
 *
 * The proposed syntax for the details element is:
 *
 * ::: details [summary-content]
 * contents, which are sometimes further block elements
 * :::
 */

const colon = ':';
const openBracket = '[';
const closeBracket = ']';
const newline = '\n';
const space = ' ';
const tab = '\t';

let redact;

module.exports = function details() {
  const Parser = this.Parser;
  const tokenizers = Parser.prototype.blockTokenizers;
  const methods = Parser.prototype.blockMethods;
  const restorationMethods = Parser.prototype.restorationMethods;

  restorationMethods.details = function(add, nodes, content, children) {
    const colonCount = nodes.open.openingColonCount;
    const open = add({
      type: 'paragraph',
      children: [
        {
          type: 'rawtext',
          value: `${colon.repeat(colonCount)} details [${content}]`
        }
      ]
    });

    const childNodes = children.map(child => add(child));

    const close = add({
      type: 'paragraph',
      children: [
        {
          type: 'rawtext',
          value: colon.repeat(colonCount)
        }
      ]
    });

    return [open, ...childNodes, close];
  };
  redact = Parser.prototype.options.redact;
  tokenizers.details = tokenizeDetails;

  /* Run it just before `paragraph`. */
  methods.splice(methods.indexOf('paragraph'), 0, 'details');
};

function tokenizeDetails(eat, value, silent) {
  let index = 0;
  let character = value.charAt(index);
  let subvalue = '';

  if (character !== colon) {
    return false;
  }

  const eatOne = function() {
    subvalue += character;
    index++;
    character = value.charAt(index);
  };

  const eatUntil = function(condition) {
    let eatenValue = '';
    while (index < value.length) {
      if (condition()) {
        break;
      }

      eatenValue += character;
      eatOne();
    }

    return eatenValue;
  };

  const eatWhitespace = function() {
    return eatUntil(() => !(character === space || character === tab));
  };

  const eatLine = function() {
    const line = eatUntil(() => character === newline) + character;
    eatOne();
    return line;
  };

  // 1/6: Eat opening colons
  eatUntil(() => character !== colon);
  if (index < 3) {
    return;
  }
  const openingColonCount = index;

  // 2/6: Eat whitespace and "details"
  eatWhitespace();
  const name = eatUntil(() => character === space || character === tab);
  if (name !== 'details') {
    return;
  }
  eatWhitespace();

  // 3/6: Eat summary content
  if (character !== openBracket) {
    return false;
  }
  eatOne();
  const summaryContent = eatUntil(() => character === closeBracket);
  eatOne();

  // 4/6: Eat trailing colons
  eatWhitespace();
  eatUntil(() => character !== colon);
  eatWhitespace();
  if (character !== newline) {
    return false;
  }
  eatOne();

  // 5/6: Eat body content and closing colons
  let bodyContent = '';
  let closed = false;
  while (index < value.length) {
    // First, check to see if the next line is our closing line.  To achieve
    // this, if the next line starts with a colon we eat all the colons and
    // check to make sure that:
    //
    //   1. The entire line is just colons. If not, then this is just regular
    //      body content.
    //   2. The line is at least as long as our opening set of colons. If not,
    //      then this is likely the closing line of a nested element and should be
    //      treated as part of the body.
    //
    // If either of these conditions is invalidated, then the string we just
    // ate was not actually our closing line, so treat it as just part of the
    // body and move on
    if (character === colon) {
      const closingColons = eatUntil(() => character !== colon);
      if (
        closingColons.length >= openingColonCount &&
        (character === '' || character === newline)
      ) {
        closed = true;
        break;
      } else {
        bodyContent += closingColons;
      }
    }

    // If we didn't find the closing line, then eat the next line of content
    // (or the rest of the line, if we already ate part of the next line when
    // checking for closing)
    bodyContent += eatLine();
  }
  if (!closed) {
    return false;
  }

  // 6/6 Consume and return parsed content
  const now = eat.now();
  const add = eat(subvalue);
  const summary = this.tokenizeInline(summaryContent, now);
  const exit = this.enterBlock();
  const body = this.tokenizeBlock(bodyContent, now);
  exit();

  if (redact) {
    const open = add({
      type: 'redaction',
      redactionType: 'details',
      block: true,
      children: summary,
      openingColonCount
    });

    const contents = body.map(content => add(content));

    const close = add({
      type: 'redaction',
      block: true,
      closing: true
    });

    return [open, ...contents, close];
  }

  return add({
    type: 'details',
    data: {
      hName: 'details'
    },
    children: [
      {
        type: 'summary',
        data: {
          hName: 'summary'
        },
        children: summary
      }
    ].concat(body)
  });
}

tokenizeDetails.notInLink = true;
