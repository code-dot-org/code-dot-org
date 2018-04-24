/**
 * @fileoverview Constants used in application dashboard components.
 */

import color from '@cdo/apps/util/color';
import {PropTypes} from 'react';

/**
 * Mapping of application statuses to their background and text colors.
 */
export const StatusColors = {
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
export const ApplicationStatuses = {
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
export const ApplicationFinalStatuses = [
  'accepted',
  'declined',
  'waitlisted',
  'withdrawn'
];

/**
 * Constants for Regional Partner dropdown
 */
export const ALL_PARTNERS_LABEL = "All Regional Partners' Applications";
export const ALL_PARTNERS_VALUE = "all";
export const UNMATCHED_PARTNER_LABEL = "No Partner/Unmatched";
export const UNMATCHED_PARTNER_VALUE = "none";

export const ALL_PARTNERS_OPTION = {label: ALL_PARTNERS_LABEL, value: ALL_PARTNERS_VALUE};
export const UNMATCHED_PARTNER_OPTION = {label: UNMATCHED_PARTNER_LABEL, value: UNMATCHED_PARTNER_VALUE};

export const RegionalPartnerValuePropType = PropTypes.oneOfType([
  PropTypes.number, // regional partner id
  PropTypes.oneOf([ALL_PARTNERS_VALUE, UNMATCHED_PARTNER_VALUE])
]);

export const RegionalPartnerPropType = PropTypes.shape({
  value: RegionalPartnerValuePropType.isRequired,
  label: PropTypes.string.isRequired
});
