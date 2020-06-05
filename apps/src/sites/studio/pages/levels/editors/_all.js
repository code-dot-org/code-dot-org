import $ from 'jquery';

$(document).ready(initPage);

function initPage() {
  function make_selection_handler(flag) {
    return function(e) {
      e.preventDefault();
      const options = $(this)
        .parent()
        .siblings('select')
        .children('option');
      options[flag ? 'attr' : 'removeAttr']('selected', true);
    };
  }

  $('.select_all').click(make_selection_handler(true));
  $('.select_none').click(make_selection_handler(false));

  $('#plusAnswerContainedLevel').on('click', () => {
    $('#plusAnswerContainedLevel')
      .prev()
      .clone()
      .insertBefore('#plusAnswerContainedLevel');
  });

  $('#plusPreloadAssetList').on('click', () => {
    $('#plusPreloadAssetList')
      .prev()
      .clone()
      .insertBefore('#plusPreloadAssetList');
  });
}
