var errorMapper = require('./errorMapper');

var annotations = [];
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
    console.log('Setting droplet editor annotations');
    dropletEditor.setAnnotations(annotations);
  }
  else {
    console.log('Setting ace editor annotations only');
    aceSession.setAnnotations(annotations);
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
    console.log('Detaching from session.');
    aceSession = null;
    dropletEditor = null;
  },

  attachToSession: function (session, editor) {
    console.log('Attaching to session', session, editor);
    if (!editor) {
      debugger
    }
    if (aceSession && session !== aceSession) {
      throw new Error('Already attached to ace session');
    }
    aceSession = session;
    dropletEditor = editor;
  },

  setJSLintAnnotations: function (jslintResults) {
    errorMapper.processResults(jslintResults);
    // clone annotations in case anyone else has a reference to data
    annotations = jslintResults.data.slice();
    updateGutter();
  },

  /**
   * @param {string} level
   * @param {number} lineNumber One index line number
   * @param {string} text Error string
   */
  addRuntimeAnnotation: function (level, lineNumber, text) {
    var annotation = {
      row: lineNumber - 1,
      col: 0,
      raw: text,
      text: text,
      type: level.toLowerCase()
    };
    annotations.push(annotation);
    updateGutter();
  },
};
