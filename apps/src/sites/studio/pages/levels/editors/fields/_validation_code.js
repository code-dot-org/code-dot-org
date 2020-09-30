import $ from 'jquery';

$(initPage);

function initPage() {
  const freePlay = $('#level_free_play');
  const autoValidate = $('#level_validation_enabled');
  if (freePlay && autoValidate) {
    freePlay.on('click', () => enforceMutualExclusion(freePlay, autoValidate));
    autoValidate.on('click', () =>
      enforceMutualExclusion(autoValidate, freePlay)
    );

    enforceMutualExclusion(freePlay, autoValidate);
    enforceMutualExclusion(autoValidate, freePlay);
  }
}

function enforceMutualExclusion(clicked, other) {
  other.prop('disabled', clicked.prop('checked'));
}
