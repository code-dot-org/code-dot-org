/**
 * @file Function that initializes a CodeMirror editor in place of a textarea.
 */
/* global inlineAttach */
import $ from 'jquery';
var CodeMirror = require('codemirror');
require("codemirror/mode/markdown/markdown");
require("codemirror/addon/edit/closetag");
require("codemirror/addon/edit/matchtags");
require("codemirror/addon/edit/matchbrackets");
require("codemirror/addon/edit/trailingspace");
require("codemirror/addon/fold/xml-fold");
require("codemirror/mode/xml/xml");
require("codemirror/mode/javascript/javascript");
require("./vendor/codemirror.inline-attach");

/**
 * initializeCodeMirror replaces a textarea on the page with a full-featured
 * CodeMirror editor.
 * @param {!string|!Element} target - element or id of element to replace.
 * @param {!string} mode - editor syntax mode
 * @param {function} [callback] - onChange callback for editor
 * @param {booblen} [attachments] - whether to enable attachment uploading in
 *        this editor.
 */
module.exports = function (target, mode, callback, attachments) {
  // Code mirror parses html using xml mode
  var htmlMode = false;
  if (mode === 'html') {
    mode = 'xml';
    htmlMode = true;
  }

  var node = target.nodeType ? target : document.getElementById(target);
  var editor = CodeMirror.fromTextArea(node, {
    mode: mode,
    htmlMode: htmlMode,
    viewportMargin: Infinity,
    matchTags: {bothTags: true},
    autoCloseTags: true,
    showTrailingSpace: true,
    lineWrapping: true
  });
  if (callback) {
    editor.on('change', callback);
  }
  if (attachments) {

    // default options are for markdown mode
    var attachOptions = {
      uploadUrl: '/level_assets/upload',
      uploadFieldName: 'file',
      downloadFieldName: 'newAssetUrl',
      allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
      progressText: '![Uploading file...]()',
      urlText: "![]({filename})", // `{filename}` tag gets replaced with URL
      errorText: "Error uploading file; images must be no larger than 1MB",
      extraHeaders: {
        'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
      }
    };

    if (mode === 'javascript') {
      attachOptions.progressText = '"Uploading file..."';
      attachOptions.urlText = '"{filename}"';
    }

    inlineAttach.attachToCodeMirror(editor, attachOptions);
  }
  return editor;
};
