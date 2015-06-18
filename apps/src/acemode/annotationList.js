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
  aceSession.setAnnotations(annotations);

  if (dropletEditor) {
    // TODO: connect to missing hover event to show text
    // TODO: differentiate between error and warning (type is always warning)

    // Reset all decorations:
    dropletEditor.gutterDecorations = {};
    dropletEditor.redrawMain();

    // Add each annotation as a gutter decoration:
    for (var i = 0; i < annotations.length; i++) {
      dropletEditor.addGutterDecoration(
          annotations[i].row,
          'droplet-' + annotations[i].type);
    }
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
