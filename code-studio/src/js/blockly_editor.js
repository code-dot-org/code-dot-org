var CodeMirror = require('codemirror');
require("codemirror/mode/markdown/markdown");
require("codemirror/addon/edit/closetag");
require("codemirror/addon/edit/matchtags");
require("codemirror/addon/edit/matchbrackets");
require("codemirror/addon/fold/xml-fold");
require("codemirror/mode/xml/xml");
require("codemirror/mode/javascript/javascript");
require("@cdo/code-studio-vendor/js/codemirror.inline-attach");
require("marked");

/* global inlineAttach */

function codeMirror(name, mode, callback, attachments) {
  // Code mirror parses html using xml mode
  var htmlMode = false;
  if (mode === 'html') {
    mode = 'xml';
    htmlMode = true;
  }

  var editor = CodeMirror.fromTextArea(document.getElementById('level_' + name), {
    mode: mode,
    htmlMode: htmlMode,
    viewportMargin: Infinity,
    matchTags: {bothTags: true},
    autoCloseTags: true,
    lineWrapping: true
  });
  if (callback) {
    editor.on('change', callback);
  }
  if (attachments) {
    inlineAttach.attachToCodeMirror(editor, {
      uploadUrl: '/level_assets/upload',
      uploadFieldName: 'file',
      downloadFieldName: 'newAssetUrl',
      allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
      progressText: '![Uploading file...]()',
      urlText: "![]({filename})", // `{filename}` tag gets replaced with URL
      errorText: "Error uploading file",
      extraHeaders: {
        'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
      }
    });
  }
  return editor;
}
// Export to window
window.CodeMirror = CodeMirror; // Necessary until json_editor is removed from dashboard
window.codeMirror = codeMirror;

// On page load, specifically for the editor page.
$(function () {
  var jQuerySuccessConditionBox = $('#level_success_condition');
  if (jQuerySuccessConditionBox.length) {
    CodeMirror.fromTextArea(jQuerySuccessConditionBox.get(0), {
      mode: 'javascript',
      viewportMargin: Infinity,
      matchBrackets: true
    });
  }

  var jQueryFailureConditionBox = $('#level_failure_condition');
  if (jQueryFailureConditionBox.length) {
    CodeMirror.fromTextArea(jQueryFailureConditionBox.get(0), {
      mode: 'javascript',
      viewportMargin: Infinity,
      matchBrackets: true
    });
  }
});
