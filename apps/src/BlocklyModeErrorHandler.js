import JavaScriptModeErrorHandler from './JavaScriptModeErrorHandler';

// Number of surrounding context lines to show (before and after). A value of 0
// will only show the line that threw the error.
const context = 2;

export default class BlocklyModeErrorHandler extends JavaScriptModeErrorHandler {
  output_(message, logLevel, lineNumber) {
    try {
      console.groupCollapsed(message);

      const interpreter = this.getJsInterpreter_();
      if (lineNumber && interpreter) {
        const start = Math.max(lineNumber - context - 1, 0);
        const count = context * 2 + 1;
        const message = interpreter.codeInfo.code.split(/\n/g).splice(start, count).map((line, n) => {
          return (n === context ? '>>>  ' : '     ') + line;
        }).join('\n');
        console.log(message);
      } else {
        console.log('No context available.');
      }
    } finally {
      console.groupEnd();
    }
  }
}
