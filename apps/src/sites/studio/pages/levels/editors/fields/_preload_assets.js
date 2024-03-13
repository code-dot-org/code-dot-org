/* eslint-disable import/order */
import $ from 'jquery';

$(document).ready(initPage);

function initPage() {
  $('#plusPreloadAssetList').on('click', () => {
    $('#plusPreloadAssetList')
      .prev()
      .clone()
      .insertBefore('#plusPreloadAssetList');
  });
}
