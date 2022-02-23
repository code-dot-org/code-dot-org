import {mapValues, omit} from 'lodash';

export const dataByStatus = {
  unreviewed: {locked: 0, total: 0},
  reopened: {locked: 0, total: 0},
  pending: {locked: 0, total: 0},
  waitlisted: {locked: 0, total: 0},
  declined: {locked: 0, total: 0},
  accepted_not_notified: {locked: 0, total: 0},
  accepted_notified_by_partner: {locked: 0, total: 0},
  accepted_no_cost_registration: {locked: 0, total: 0},
  registration_sent: {locked: 0, total: 0},
  paid: {locked: 0, total: 0}
};

// Returns a new object of the form
//   {
//    csd_teachers: {
//      unreviewed: {locked: 0, total: 0},
//      pending: {locked: 0, total: 0},
//    },
//    csp_teachers: {
//      unreviewed: {locked: 0, total: 0},
//      pending: {locked: 0, total: 0},
//    }
// The `data` comes in from /api/v1/pd/applications?regional_partner_value=:regional_partner_value
// with the shape
// data = {
//   csd_teachers: {
//     unreviewed: {locked: 0, total: 0},
//     incomplete: {locked: 0, total: 0},
//     pending: {locked: 0, total: 0},
//   },
//   csp_teachers: {
//     unreviewed: {locked: 0, total: 0},
//     incomplete: {locked: 0, total: 0},
//     pending: {locked: 0, total: 0},
//   }
// and is used for the "Summary" View on the Application Dashboard.
// Anyone who is not a workshop admin should not see incomplete data, so we strip it here.
export const removeIncompleteAppsFromSummaryView = data =>
  mapValues(data, data_by_status => omit(data_by_status, ['incomplete']));
