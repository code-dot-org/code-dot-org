/**
 * @fileoverview Constants used in application dashboard components.
 */

import color from '@cdo/apps/util/color';

/**
 * Mapping of application statuses to their background and text colors.
 */
exports.StatusColors = {
  'unreviewed': {
    backgroundColor: color.charcoal,
    color: color.white
  },
  'pending': {
    backgroundColor: color.lighter_orange,
    color: color.black
  },
  'interview': {
    backgroundColor: color.orange,
    color: color.black
  },
  'waitlisted': {
    backgroundColor: color.level_passed,
    color: color.black
  },
  'accepted': {
    backgroundColor: color.level_perfect,
    color: color.black
  },
  'declined': {
    backgroundColor: color.red,
    color: color.white
  },
  'withdrawn': {
    backgroundColor: color.lightest_red,
    color: color.black
  }
};

/**
 * Valid statuses for Applications.
 */
exports.ApplicationStatuses = {
  'teacher': [
    'Unreviewed',
    'Pending',
    'Waitlisted',
    'Accepted',
    'Declined',
    'Withdrawn'
  ],
  'facilitator': [
    'Unreviewed',
    'Pending',
    'Interview',
    'Waitlisted',
    'Accepted',
    'Declined',
    'Withdrawn'
  ]
};

/**
 * Statuses that represent "finalized" applications
 */
exports.ApplicationFinalStatuses = [
  'accepted',
  'declined',
  'waitlisted',
];

/**
 * Constants for Regional Partner dropdown
 */
const allPartnersLabel = "All Regional Partners' Applications";
const allPartnersFilter = "all";
const unmatchedLabel = "No Partner/Unmatched";
const unmatchedFilter = "none";
exports.AllPartnersLabel = allPartnersLabel;
exports.AllPartnersFilter = allPartnersFilter;
exports.UnmatchedLabel = unmatchedLabel;
exports.UnmatchedFilter = unmatchedFilter;

exports.RegionalPartnerDropdownOptions = [
  {value: unmatchedFilter, label: unmatchedLabel},
  {value: allPartnersFilter, label: allPartnersLabel}
];
