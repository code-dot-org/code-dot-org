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
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/javascript-lint';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/javascript/javascript';
import './vendor/codemirror.inline-attach';
import jsonic from 'jsonic';
import {JSHINT} from 'jshint';

import React from 'react';
import ReactDOM from 'react-dom';
import UnsafeRenderedMarkdown from '../templates/UnsafeRenderedMarkdown';

window.JSHINT = JSHINT;

CodeMirrorSpellChecker({
  codeMirrorInstance: CodeMirror,
});

const VALID_COLOR = 'black';
const INVALID_COLOR = '#d00';

/**
 * initializeCodeMirror replaces a textarea on the page with a full-featured
 * CodeMirror editor.
 * @param {!string|!Element} target - element or id of element to replace.
 * @param {!string} mode - editor syntax mode
 * @param {function} [callback] - onChange callback for editor
 * @param {booblen} [attachments] - whether to enable attachment uploading in
 *        this editor.
 */
function initializeCodeMirror(target, mode, callback, attachments, onUpdateLinting) {
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
        ReactDOM.render(
          React.createElement(UnsafeRenderedMarkdown, {
            markdown: editor.getValue(),
            forceRemark: !editor.getOption('useMarked')
          }),
          previewElement[0],
        );
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
    lineWrapping: true,
    gutters: ["CodeMirror-lint-markers"],
    lint: {
      onUpdateLinting,
    },
  });
  if (callback) {
    editor.on('change', callback);
    editor.on('refresh', callback);
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
}
module.exports = initializeCodeMirror;

module.exports.initializeCodeMirrorForJson = function (
  textAreaId, {validationDivId, onBlur, onChange}) {
  // Leniently validate and fix up custom block JSON using jsonic
  const textAreaEl = document.getElementById(textAreaId);
  if (textAreaEl) {
    const jsonValidationDiv = validationDivId ?
      $(`#${validationDivId}`) :
      $(textAreaEl.parentNode.insertBefore(
        document.createElement('div'),
        textAreaEl.nextSibling
      ));
    const showErrors = (fn) => (arg) => {
      try {
        if (fn) {
          fn(arg);
        }
        jsonValidationDiv.text('JSON appears valid.');
        jsonValidationDiv.css('color', VALID_COLOR);
      } catch (err) {
        jsonValidationDiv.text(err.toString());
        jsonValidationDiv.css('color', INVALID_COLOR);
      }
    };
    const fixupJson = showErrors(() => {
      if (jsonEditor.getValue().trim()) {
        let blocks = jsonic(jsonEditor.getValue().trim());
        if (onBlur) {
          blocks = onBlur(blocks);
        }
        if (onChange) {
          onChange(jsonEditor);
        }
        jsonEditor.setValue(JSON.stringify(blocks, null, 2));
      } else {
        jsonEditor.setValue('');
      }
    });

    const jsonEditor =
      initializeCodeMirror(textAreaId, 'application/json', showErrors(onChange));
    jsonEditor.on('blur', fixupJson);
    fixupJson();
    return fixupJson;
  }
};
