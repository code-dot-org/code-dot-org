/**
 * @file Function that initializes a CodeMirror editor in place of a textarea.
 */
/* global inlineAttach */
'use strict';
var CodeMirror = require('codemirror');
require("codemirror/mode/markdown/markdown");
require("codemirror/addon/edit/closetag");
require("codemirror/addon/edit/matchtags");
require("codemirror/addon/edit/matchbrackets");
require("codemirror/addon/fold/xml-fold");
require("codemirror/mode/xml/xml");
require("codemirror/mode/javascript/javascript");
require("@cdo/code-studio-vendor/js/codemirror.inline-attach");

/**
 * initializeCodeMirror replaces a textarea on the page with a full-featured
 * CodeMirror editor.
 * @param {!string} name (partial) name of the textarea to replace.
 * @param {!string} mode - editor syntax mode
 * @param {function} [callback] - onChange callback for editor
 * @param {booblen} [attachments] - whether to enable attachment uploading in
 *        this editor.
 */
module.exports = function (name, mode, callback, attachments) {
  // Code mirror parses html using xml mode
  var htmlMode = false;
  if (mode === 'html') {
    mode = 'xml';
    htmlMode = true;
  }

  var editor = CodeMirror.fromTextArea(document.getElementById(name), {
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
};
