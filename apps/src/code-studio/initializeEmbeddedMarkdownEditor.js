/**
 * @file Defines a function for initializing an embedded markdown editor using
 *       CodeMirror
 */
var initializeCodeMirror = require('./initializeCodeMirror');

/**
 * Initializes a live preview markdown editor that spits its contents out into
 * a given text area as embedded markdown of the form:
 *
 *    markdown <<MARKDOWN
 *    My markdown here
 *    MARKDOWN
 *
 *    for a DSL element
 *
 * For a non DSL element, use initializeCodeMirror
 *
 * @param {jQuery} embeddedElement textarea element within which to embed the markdown
 * @param {string} markdownTextArea id (which will be prefixed by "level_")
 *                                  of textarea where editor will live
 * @param {string} name of the property within the textarea
 */
module.exports = function(embeddedElement, markdownTextArea, markdownProperty) {
  var regex = new RegExp(
    '^' + markdownProperty + ' <<(\\w*)\\n([\\s\\S]*?)\\n\\1\\s*$',
    'm'
  );
  var dslElement = embeddedElement;
  var dslText = dslElement.val();

  var mdEditor = initializeCodeMirror(markdownTextArea, 'markdown', {
    callback: function(editor, change) {
      var editorText = editor.getValue();
      var dslText = dslElement.val();
      var replacedText;
      if (regex.exec(dslText)) {
        replacedText = dslText.replace(
          regex,
          markdownProperty + ' <<$1\n' + editorText + '\n$1\n'
        );
      } else {
        replacedText =
          dslText +
          '\n' +
          markdownProperty +
          ' <<MARKDOWN\n' +
          editorText +
          '\nMARKDOWN\n';
      }
      dslElement.val(replacedText);
    },
    attachments: true
  });

  // Match against markdown heredoc syntax and capture contents in [2].
  var match = regex.exec(dslText);
  if (match && match[2]) {
    var markdownText = match[2];
    mdEditor.setValue(markdownText);
  } else {
    mdEditor.setValue('');
  }
};
