import annotationList from './acemode/annotationList';

/**
 * Extends the StudioApp to provide means of annotating and highlighting editor
 * lines.
 */
export default class EditorAnnotator {
  constructor(studioApp) {
    /*
     * Retain StudioApp instance.
     */
    this._studioApp = studioApp;

    /*
     * Tracks any highlighted lines.
     */
    this.highlightedLines = [];
  }

  /**
   * Highlights the given line in the active editor.
   *
   * @param {number} lineNumber The line number to highlight in the active editor.
   * @param {string} highlightClass The class name to add to the line.
   */
  highlightLine(lineNumber, highlightClass = 'ace_step') {
    var session = this._studioApp.editor.aceEditor.getSession();
    let marker = session.addMarker(
      new (window.ace.require('ace/range').Range)(
        lineNumber - 1,
        0,
        lineNumber - 1,
        session.getLine(lineNumber - 1).length
      ),
      highlightClass,
      'text'
    );
    this.highlightedLines.push(marker);
  }

  /**
   * Clears any lines highlighted by highlightLine.
   */
  clearHighlightedLines() {
    var session = this._studioApp.editor.aceEditor.getSession();
    this.highlightedLines.forEach(lineNumber => {
      session.removeMarker(lineNumber);
    });
    this.highlightedLines = [];
  }

  /**
   * Add a line of feedback to the editor.
   *
   * @param {string} message The text to display next to the line.
   * @param {number} lineNumber The line number (1-based index)
   * @param {string} logLevel The type of annotation ('ERROR', 'INFO', etc)
   */
  annotateLine(message, lineNumber, logLevel = 'INFO') {
    annotationList.addRuntimeAnnotation(logLevel, lineNumber, message);
  }

  /**
   * Removes annotations of a particular type.
   */
  clearAnnotations(logLevel = 'INFO') {
    annotationList.filterOutRuntimeAnnotations(logLevel);
  }
}
