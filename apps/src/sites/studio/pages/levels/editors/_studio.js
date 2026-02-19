import {javascript} from '@codemirror/lang-javascript';
import {bracketMatching} from '@codemirror/language';
import {EditorState} from '@codemirror/state';
import {EditorView} from '@codemirror/view';
import $ from 'jquery';

/**
 * @file Main entry point for scripts used only in levelbuilder on when editing
 *       studio-type levels.
 */

function initializeEditor(textarea) {
  const editorContainer = document.createElement('div');
  textarea.style.display = 'none';
  textarea.insertAdjacentElement('afterend', editorContainer);

  return new EditorView({
    state: EditorState.create({
      doc: textarea.value || '',
      extensions: [
        javascript(),
        bracketMatching(),
        EditorView.lineWrapping,
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

// On page load, specifically for this editor page.
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
