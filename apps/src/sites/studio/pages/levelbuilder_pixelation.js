/** @file Javascript for the pixelation widget levelbuilder edit page */
import $ from 'jquery';

$(() => {
  const pixelationVersionDropdown = $('#level_version');

  // When the version changes, show/hide relevant fields
  pixelationVersionDropdown.change(() => {
    showAndHideFieldsForVersion(pixelationVersionDropdown.val());
  });

  // On load, show/hide fields based on version
  showAndHideFieldsForVersion(pixelationVersionDropdown.val());
});

function showAndHideFieldsForVersion(version) {
  // Only show the initial width/height fields for version 1
  $('.initial-dimensions').toggle(version === '1');
}
