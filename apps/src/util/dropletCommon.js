/*globals dashboard*/
import trackEvent from '@cdo/apps/util/trackEvent';

/**
 * Runs the user's droplet code through the droplet parser. If droplet is unable
 * to parse the user's code, call the error callback with any information we
 * have regarding the error. Additionally, this will return `true` if any
 * errors are detected and `false` otherwise.
 * @param {object} dropletEditor The droplet engine
 * @param {function} errorCallback The function to call if an error is detected.
 *                   Usage: errorCallback(lineNumber, errorMessage)
 * @returns {boolean} true if an error was detected. false otherwise.
 */
const findDropletParseErrors = (dropletEditor, errorCallback) => {
  if (!dropletEditor) {
    return false;
  }

  try {
    dropletEditor.parse();
  } catch (error) {
    let errorObject;
    try {
      errorObject = JSON.parse(error.message);
    } catch (_) {
      // Do nothing. We are just checking if the error is in a JSON format.
    }

    let lineNumber = errorObject && errorObject.line;
    if (lineNumber) {
      // We were able to find the line number. Report it to the user.

      if (errorObject.type === 'IncorrectBlockParent') {
        // June 2020: We believe this specific error is only triggered when a
        // curly bracket isn't attached to a function, loop, or conditional. If
        // in the future we verify this is true, create a user-friendly error
        // message to report to the user.
        trackEvent(
          'Research',
          errorObject.type,
          `ShareURL:${dashboard.project.getShareUrl()}`
        );
      } else {
        // It's unknown what javascript text causes certain droplet errors. If
        // we discover an unknown error, log it to Google Analytics so we can
        // create a user-friendly error message.
        trackEvent(
          'Research',
          'UnknownDropletError',
          `DropletError ${errorObject.type}: ${
            errorObject.message
          }--ShareURL:${dashboard.project.getShareUrl()}`
        );
      }
      errorCallback(Number(lineNumber) + 1, errorObject.message);
      return true;
    } else {
      // We couldn't find the line number. Display the error to the student and
      // log this in Google Analytics so we can update droplet to return the
      // line number with this error.
      trackEvent(
        'Research',
        'CouldNotFindDropletParseErrorLineNumber',
        'DropletError:' + error.message
      );
      errorCallback(0 /* lineNumber */, error.message);
      return true;
    }
  }

  return false;
};

module.exports = {
  findDropletParseErrors
};
