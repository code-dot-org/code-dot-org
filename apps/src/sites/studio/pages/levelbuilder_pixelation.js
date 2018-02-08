/** @file Javascript for the pixelation widget levelbuilder edit page */
import $ from 'jquery';
import 'jquery-ui/ui/effect'; // Add easing functions

let pixelationVersionDropdown;
let hideSlidersField;
let initialDimensionsField;

$(() => {
  pixelationVersionDropdown = $('#level_version');
  hideSlidersField = $('.hide-sliders');
  initialDimensionsField = $('.initial-dimensions');

  // When the version changes, show/hide relevant fields
  pixelationVersionDropdown.change(() => {
    showAndHideFieldsForVersion(pixelationVersionDropdown.val(), true);
  });

  // On load, show/hide fields based on version without animation
  showAndHideFieldsForVersion(pixelationVersionDropdown.val(), false);
});

function showAndHideFieldsForVersion(version, animate) {
  // Only show the initial width/height fields and the hide sliders checkbox
  // for version 1
  const version1Fields = [hideSlidersField, initialDimensionsField];
  if (version === '1') {
    toggleFields(version1Fields, 'slideDown', animate);
  } else {
    toggleFields(version1Fields.reverse(), 'slideUp', animate);
  }
}

/**
 * Show or hide a group of jQuery elements.  If animating, offset them in time
 * to help communicate that they are separate concerns.
 * For more on why animation offset is a good idea, see:
 * https://medium.com/@ux_in_motion/creating-usability-with-motion-the-ux-in-motion-manifesto-a87a4584ddc#88d5
 * @param {jQuery[]} fields
 * @param {'slideDown'|'slideUp'} motion
 * @param {boolean} animate
 */
function toggleFields(fields, motion, animate) {
  if (animate) {
    const easing = motion === 'slideDown' ? 'easeOutBack' : 'swing';
    const speed = motion === 'slideDown' ? 400 : 200;
    const delay = motion === 'slideDown' ? 200 : 100;
    fields.forEach((field, index) => field.delay(index * delay)[motion](speed, easing));
  } else {
    fields.forEach(field => field[motion](0));
  }
}
