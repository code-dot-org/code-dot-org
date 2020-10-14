/** @file Decorator and delegator for error, warning and info events in toolkits
 * that use droplet and allow students to write and execute JavaScript. */
import annotationList from './acemode/annotationList';
import logToCloud from './logToCloud';
import {makeEnum} from './utils';

/** @enum {string} */
export const LogLevel = makeEnum('ERROR', 'WARNING');

/**
 * Logging, annotation and error reporting mediator for use with toolkits where
 * students write JavaScript.
 * @param {function():JSInterpreter} getJsInterpreter
 * @param {LogTarget} logTarget
 * @constructor
 */
export default class JavaScriptModeErrorHandler {
  constructor(getJsInterpreter, logTarget) {
    this.getJsInterpreter_ = getJsInterpreter;
    this.logTarget_ = logTarget;
  }

  /**
   * Report an error.  This will log to configured log targets (usually
   * window.console and the onscreen console), set up a runtime annotation at the
   * current user code line if we're currently running the interpreter, and
   * will report the error up to New Relic.
   * @param {string} errorString
   * @param {number} [lineNumber]
   */
  outputError(errorString, lineNumber, libraryName) {
    this.output_(errorString, LogLevel.ERROR, lineNumber, libraryName);
  }

  /**
   * Report a warning.  This will log to configured log targets (usually
   * window.console and the onscreen console) and set up a runtime annotation at
   * the current user code line if we're currently running the interpreter.
   * @param {string} errorString
   * @param {number} [lineNumber]
   */
  outputWarning(errorString, lineNumber) {
    this.output_(errorString, LogLevel.WARNING, lineNumber);
  }

  /**
   * Get a outputWarning() function that binds against the current line number, so we can
   * report a later error at this line.
   * @returns {function(string)}
   */
  getAsyncOutputWarning() {
    const lineNumber = this.getNearestUserCodeLine_();
    return error => {
      if (error.msg) {
        this.output_(error.msg, LogLevel.WARNING, lineNumber);
      } else {
        this.output_(error, LogLevel.WARNING, lineNumber);
      }
    };
  }

  /**
   * @param {string} message
   * @param {LogLevel} logLevel
   * @param {number} [lineNumber] - if omitted, we'll try to infer a line number
   *        from the interpreter's current user code line.  However for async
   *        calls we may want to pass this in to set a specific line number.
   * @private
   */
  output_(message, logLevel, lineNumber, libraryName) {
    if (lineNumber === undefined) {
      lineNumber = this.getNearestUserCodeLine_();
    }

    let logText = `${logLevel}: `;
    if (lineNumber !== undefined) {
      logText += `Line: ${lineNumber}: `;
    }
    logText += message;

    // Send the assembled output to our logging service.
    this.logTarget_.log(logText, logLevel);

    // Add an annotation directly in the editor for this output
    if (lineNumber !== undefined && !libraryName) {
      annotationList.addRuntimeAnnotation(logLevel, lineNumber, message);
    }

    // Send to New Relic if it's an error and meets our sampling rate
    if (logLevel === LogLevel.ERROR) {
      logToCloud.addPageAction(
        logToCloud.PageAction.UserJavascriptError,
        {
          error: message
        },
        1 / 20
      );
    }
  }

  /**
   * @returns {number|undefined} The nearest user code line according to the
   *          active interpreter, or undefined if no interpreter can be found.
   * @private
   */
  getNearestUserCodeLine_() {
    if (typeof this.getJsInterpreter_ === 'function') {
      const interpreter = this.getJsInterpreter_();
      if (interpreter) {
        return 1 + interpreter.getNearestUserCodeLine();
      }
    }
    return undefined;
  }
}

/**
 * An object that can consume strings and log them somewhere.
 * @interface LogTarget
 */
/**
 * @function
 * @name LogTarget#log
 * @param {string} logString
 */
