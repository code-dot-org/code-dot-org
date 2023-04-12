import $ from 'jquery';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-poems]');
  const poems = JSON.parse(script.dataset.poems);
  const hocPoems = poems.poetry_hoc;
  const timeCapsulePoems = poems.time_capsule;

  function updatePoemSelection() {
    const defaultPoem = $('#defaultPoem');
    var selectionValue = $('#level_standalone_app_name').val().toLowerCase();
    const defaultPoemSelect = $('#level_default_poem');
    const availablePoemsSelect = $('#level_available_poems');
    if (selectionValue === 'poetry') {
      defaultPoem.addClass('collapse');
    } else {
      defaultPoem.removeClass('collapse');
      let poems = hocPoems;
      if (selectionValue === 'time_capsule') {
        poems = timeCapsulePoems;
      }
      resetPoemList(defaultPoemSelect, poems);
      resetPoemList(availablePoemsSelect, poems);
    }
    // always unset selected poem and dropdown poems
    defaultPoemSelect.val([]);
    availablePoemsSelect.val([]);
  }

  function resetPoemList(selectElement, poems) {
    // reset dropdown options
    selectElement.empty();
    // append all poems
    poems.forEach(poem => {
      selectElement.append(new Option(poem[0], poem[1]));
    });
  }

  $('.poem-subtype-dropdown').on('change', updatePoemSelection);
}
