import $ from 'jquery';

import {
  AdaptiveContentError,
  findReferenceProblems,
  parsePathwaySource,
} from '@cdo/apps/adaptive/schema';

// What contentFilesTest.ts checks in CI, short of the level files.
function contentProblems(text, adaptiveId) {
  try {
    const source = parsePathwaySource(JSON.parse(text));
    const problems = findReferenceProblems(source);
    if (source.id !== adaptiveId) {
      problems.unshift(
        `id: '${source.id}' does not match the Content ID '${adaptiveId}'`
      );
    }
    return problems;
  } catch (error) {
    return error instanceof AdaptiveContentError
      ? error.problems
      : [error.message];
  }
}

$(document).ready(() => {
  const container = document.getElementById('adaptive-content-editor');
  if (!container) {
    return;
  }
  const textarea = document.getElementById('level_adaptive_content_json');
  const select = document.getElementById('level_adaptive_id');
  const lockNote = document.getElementById('adaptive-content-locked');
  const savedId = container.dataset.savedAdaptiveId;

  const editor = window.levelbuilder.initializeCodeMirror6(textarea, 'json');
  const wrapper = editor.getWrapperElement();

  // A disabled textarea is not submitted, so the file named by the old
  // Content ID is never written under the new one.
  $(select).on('change', () => {
    const locked = select.value !== savedId;
    textarea.disabled = locked;
    wrapper.inert = locked;
    wrapper.style.opacity = locked ? '0.5' : '';
    lockNote.style.display = locked ? '' : 'none';
  });

  // jquery_ujs cancels the request when an ajax:before handler returns false.
  $(textarea.form).on('ajax:before', () => {
    if (textarea.disabled) {
      return true;
    }
    const problems = contentProblems(textarea.value, savedId);
    if (problems.length === 0) {
      return true;
    }
    window.saving = false;
    $('.publishLevelErrorMessage').show();
    $('#validation-error')
      .empty()
      .show()
      .append(
        $('<p/>').text("Couldn't save: the adaptive content is invalid."),
        $('<ul/>').append(problems.map(problem => $('<li/>').text(problem)))
      );
    return false;
  });
});
