import $ from 'jquery';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-poems]');
  const poems = JSON.parse(script.dataset.poems);
  const hocOptions = poems.poetry_hoc.map(
    option => new Option(option[0], option[1])
  );
  const timeCapsuleOptions = poems.time_capsule.map(
    option => new Option(option[0], option[1])
  );

  function updatePoemSelection() {
    const defaultPoem = $('#defaultPoem');
    var selectionValue = $('#level_standalone_app_name')
      .val()
      .toLowerCase();
    const defaultPoemSelect = $('#level_default_poem');
    if (selectionValue === 'poetry') {
      defaultPoem.addClass('collapse');
    } else {
      defaultPoem.removeClass('collapse');
      // reset dropdown options
      defaultPoemSelect.empty();
      let poems = hocOptions;
      if (selectionValue === 'time_capsule') {
        poems = timeCapsuleOptions;
      }
      poems.forEach(poem => {
        defaultPoemSelect.append(poem);
      });
    }
    // always unset selected poem
    defaultPoemSelect.val([]);
  }
  $('.poem-subtype-dropdown').on('change', updatePoemSelection);
}
