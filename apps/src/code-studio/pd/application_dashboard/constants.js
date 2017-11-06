/**
 * @fileoverview Constants used in application dashboard components.
 */

import color from '@cdo/apps/util/color';

/**
* Mapping of application statuses to their display colors.
*/
exports.StatusColor = {
  'unreviewed': color.charcoal,
  'pending': color.lighter_orange,
  'interview': color.orange,
  'waitlisted': color.level_passed,
  'accepted': color.level_perfect,
  'declined': color.red,
  'withdrawn': color.lightest_red
};

exports.StatusTextColor = {
  'unreviewed': color.white,
  'pending': color.black,
  'interview': color.black,
  'waitlisted': color.black,
  'accepted': color.black,
  'declined': color.white,
  'withdrawn': color.black
};
