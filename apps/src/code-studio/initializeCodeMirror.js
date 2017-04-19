/**
 * @file Function that initializes a CodeMirror editor in place of a textarea.
 */
/* global inlineAttach */
import $ from 'jquery';
import CodeMirror from 'codemirror';
import CodeMirrorSpellChecker from 'codemirror-spell-checker';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/matchtags';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/trailingspace';
import 'codemirror/addon/mode/overlay';
import 'codemirror/addon/fold/xml-fold';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/javascript/javascript';
import './vendor/codemirror.inline-attach';
import marked from 'marked';
import stylelessRenderer from '@cdo/apps/util/StylelessRenderer';

CodeMirrorSpellChecker({
  codeMirrorInstance: CodeMirror,
});

/**
 * initializeCodeMirror replaces a textarea on the page with a full-featured
 * CodeMirror editor.
 * @param {!string|!Element} target - element or id of element to replace.
 * @param {!string} mode - editor syntax mode
 * @param {function} [callback] - onChange callback for editor
 * @param {booblen} [attachments] - whether to enable attachment uploading in
 *        this editor.
 */
module.exports = function initializeCodeMirror(target, mode, callback, attachments) {
  let updatePreview;

  // Code mirror parses html using xml mode
  var htmlMode = false;
  if (mode === 'html') {
    mode = 'xml';
    htmlMode = true;
  }

  var node = target.nodeType ? target : document.getElementById(target);

  var backdrop = undefined;
  if (mode === 'markdown') {
    backdrop = mode;
    mode = 'spell-checker';

    // In markdown mode, look for a preview element (found by just appending
    // _preview to the target id), if it exists extend our callback to update
    // the preview element with the markdown contents
    const previewElement = $(`#${node.id}_preview`);
    if (previewElement.length > 0) {
      const originalCallback = callback;
      updatePreview = editor => {
        previewElement.html(marked(editor.getValue(), {renderer: stylelessRenderer}));
        previewElement.children('details').details();
      };

      callback = (editor, ...rest) => {
        updatePreview(editor);
        if (originalCallback) {
          originalCallback(editor, ...rest);
        }
      };

    }
  }

  var editor = CodeMirror.fromTextArea(node, {
    mode: mode,
    backdrop: backdrop,
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
  if (updatePreview) {
     updatePreview(editor);
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
