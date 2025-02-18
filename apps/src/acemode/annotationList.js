var errorMapper = require('./errorMapper');

var lintAnnotations = [];
var runtimeAnnotations = [];
var aceSession;
var dropletEditor;

/**
 * Update gutter with our annotation list
 * @private
 */
function updateGutter() {
  if (!aceSession) {
    return;
  }

  if (dropletEditor) {
    // Droplet will call aceSession.setAnnotations() under the hood
    // for us
    dropletEditor.setAnnotations(lintAnnotations.concat(runtimeAnnotations));
  } else {
    aceSession.setAnnotations(lintAnnotations.concat(runtimeAnnotations));
  }
}

/**
 * Object for tracking annotations placed in gutter. General design is as
 * follows:
 * When jslint runs (i.e. code changes) display just jslint errors
 * When code runs, display jslint errors and runtime errors. Runtime errors will
 * go away the next time jstlint gets run (when code changes)
 */
module.exports = {
  detachFromSession: function () {
    aceSession = null;
    dropletEditor = null;
  },

  attachToSession: function (session, editor) {
    if (aceSession && session !== aceSession) {
      throw new Error('Already attached to ace session');
    }
    aceSession = session;
    dropletEditor = editor;
  },

  setJSLintAnnotations: function (jslintResults, appType) {
    errorMapper.processResults(jslintResults, appType);
    // clone annotations in case anyone else has a reference to data
    lintAnnotations = jslintResults.data.slice();
    updateGutter();
  },

  /**
   * Return the array of lintAnnotations
   *
   * @returns {!Array} annotations from most recent linting pass
   */
  getJSLintAnnotations: function () {
    return lintAnnotations;
  },

  /**
   * Annotates the given line by line number with the given text and level.
   *
   * The level indicates the type of annotation. For instance, 'error' would
   * mark the line as having an error. The given text is then depicted generally
   * as a 'pop-over' when the line marker is hovered and gives further details.
   *
   * @param {string} level - The type of annotation ('info', 'warning', 'error', etc)
   * @param {number} lineNumber - Line number (indexed starting at 1)
   * @param {string} text - Error string
   */
  addRuntimeAnnotation: function (level, lineNumber, text) {
    var annotation = {
      row: lineNumber - 1,
      col: 0,
      raw: text,
      text: text,
      type: level.toLowerCase(),
    };
    runtimeAnnotations.push(annotation);
    updateGutter();
  },

  /**
   * Removes all active annotations matching the given level.
   *
   * @param {string} level - The type of annotation ('info', 'warning', 'error', etc)
   */
  filterOutRuntimeAnnotations: function (level) {
    runtimeAnnotations = runtimeAnnotations.filter(annotation => {
      return annotation.type !== level.toLowerCase();
    });
    updateGutter();
  },

  /**
   * Clears all active annotations.
   */
  clearRuntimeAnnotations: function () {
    if (runtimeAnnotations.length === 0) {
      return;
    }
    runtimeAnnotations = [];
    updateGutter();
  },
};
