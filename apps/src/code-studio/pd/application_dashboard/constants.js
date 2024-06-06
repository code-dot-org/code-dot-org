/**
 * @fileoverview Constants used in application dashboard components.
 */

import color from '@cdo/apps/util/color';

const STATUS_GREEN = {
  backgroundColor: color.level_perfect,
  color: color.black,
};
const STATUS_ORANGE = {
  backgroundColor: color.lighter_orange,
  color: color.black,
};
const STATUS_GRAY = {
  backgroundColor: color.charcoal,
  color: color.white,
};

/**
 * Mapping of application statuses to their background and text colors.
 */
export const StatusColors = {
  incomplete: STATUS_GRAY,
  reopened: STATUS_GRAY,
  awaiting_admin_approval: STATUS_GRAY,
  unreviewed: {
    backgroundColor: color.lightest_cyan,
    color: color.black,
  },
  pending: STATUS_ORANGE,
  pending_space_availability: STATUS_ORANGE,
  accepted: STATUS_GREEN,
  enrolled: STATUS_GREEN,
  declined: {
    backgroundColor: color.red,
    color: color.white,
  },
  withdrawn: {
    backgroundColor: color.lightest_red,
    color: color.black,
  },
};

/**
 * Statuses that represent "finalized" applications
 */
export const ApplicationFinalStatuses = [
  'accepted',
  'declined',
  'pending_space_availability',
  'withdrawn',
];

/**
 * Application statuses for which we require a scholarship status
 */
export const ScholarshipStatusRequiredStatuses = ['accepted'];

/**
 * Valid statuses for this year's applications.
 * Format per application type is {value: label}
 */
export const getApplicationStatuses = (addAutoEmail = false) => ({
  incomplete: 'Incomplete',
  awaiting_admin_approval: `Awaiting Admin Approval${autoEmailText(
    addAutoEmail
  )}`,
  unreviewed: 'Unreviewed',
  reopened: 'Reopened',
  pending: 'Pending',
  pending_space_availability: `Pending Space Availability`,
  accepted: `Accepted${autoEmailText(addAutoEmail)}`,
  enrolled: 'Enrolled',
  declined: `Declined${autoEmailText(addAutoEmail)}`,
  withdrawn: 'Withdrawn',
});

function autoEmailText(addAutoEmail) {
  if (addAutoEmail) {
    return ' (auto-email)';
  }
  return '';
}
