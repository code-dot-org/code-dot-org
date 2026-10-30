import {javascript} from '@codemirror/lang-javascript';
import {EditorState} from '@codemirror/state';
import {EditorView} from '@codemirror/view';
import $ from 'jquery';

import {editorConfig} from '@cdo/apps/codemirror/editorConfig';

/**
 * @file Main entry point for scripts used only in levelbuilder on when editing
 *       studio-type levels.
 */

const studioEditorTheme = EditorView.theme({
  '&': {
    border: '1px solid #eee',
  },
});

function initializeEditor(textarea) {
  const editorContainer = document.createElement('div');
  textarea.style.display = 'none';
  textarea.insertAdjacentElement('afterend', editorContainer);

  return new EditorView({
    state: EditorState.create({
      doc: textarea.value || '',
      extensions: [
        ...editorConfig,
        javascript(),
        studioEditorTheme,
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            textarea.value = update.state.doc.toString();
          }
        }),
      ],
    }),
    parent: editorContainer,
  });
}

$(document).ready(function () {
  const jQuerySuccessConditionBox = $('#level_success_condition');
  if (jQuerySuccessConditionBox.length) {
    initializeEditor(jQuerySuccessConditionBox.get(0));
  }

  const jQueryFailureConditionBox = $('#level_failure_condition');
  if (jQueryFailureConditionBox.length) {
    initializeEditor(jQueryFailureConditionBox.get(0));
  }
});
