/**
 * @fileoverview Constants used in application dashboard components.
 */

import color from '@cdo/apps/util/color';

const STATUS_GREEN = {
  backgroundColor: color.level_perfect,
  color: color.black
};

/**
 * Mapping of application statuses to their background and text colors.
 */
export const StatusColors = {
  unreviewed: {
    backgroundColor: color.charcoal,
    color: color.white
  },
  pending: {
    backgroundColor: color.lighter_orange,
    color: color.black
  },
  interview: {
    backgroundColor: color.orange,
    color: color.black
  },
  waitlisted: {
    backgroundColor: color.level_passed,
    color: color.black
  },
  accepted: STATUS_GREEN,
  accepted_not_notified: STATUS_GREEN,
  accepted_notified_by_partner: STATUS_GREEN,
  accepted_no_cost_registration: STATUS_GREEN,
  registration_sent: STATUS_GREEN,
  paid: STATUS_GREEN,
  declined: {
    backgroundColor: color.red,
    color: color.white
  },
  withdrawn: {
    backgroundColor: color.lightest_red,
    color: color.black
  }
};

/**
 * Valid statuses for this year's applications.
 * Format per application type is {value: label}
 */
export const ApplicationStatuses = {
  teacher: {
    unreviewed: 'Unreviewed',
    pending: 'Pending',
    waitlisted: 'Waitlisted (auto-email)',
    declined: 'Declined (auto-email)',
    accepted_not_notified: 'Accepted - Not notified',
    accepted_notified_by_partner: 'Accepted - Notified by partner',
    accepted_no_cost_registration:
      'Accepted - No cost registration (auto-email)',
    registration_sent: 'Registration Sent (auto-email)',
    paid: 'Paid',
    withdrawn: 'Withdrawn'
  },
  facilitator: {
    unreviewed: 'Unreviewed',
    pending: 'Pending',
    interview: 'Interview',
    waitlisted: 'Waitlisted',
    accepted: 'Accepted',
    declined: 'Declined',
    withdrawn: 'Withdrawn'
  }
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

export const ApplicationTypes = {
  teacher: 'Teacher',
  facilitator: 'Facilitator'
};

/**
 * Application statuses for which we require a scholarship status
 */
export const ScholarshipStatusRequiredStatuses = [
  'accepted_not_notified',
  'accepted_notified_by_partner',
  'accepted_no_cost_registration',
  'registration_sent',
  'paid'
];
