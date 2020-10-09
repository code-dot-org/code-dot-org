import $ from 'jquery';

$(initPage);

function initPage() {
  const freePlay = $('#level_free_play');
  const autoValidate = $('#level_validation_enabled');
  if (freePlay && autoValidate) {
    freePlay.on('click', syncWithValidate);
    if (!freePlay.prop('checked')) {
      syncWithValidate();
    }
  }
}

function syncWithValidate() {
  const freePlay = $('#level_free_play');
  const autoValidate = $('#level_validation_enabled');
  const checked = freePlay.prop('checked');
  autoValidate.prop('checked', checked);
  autoValidate.prop('disabled', !checked);
}
