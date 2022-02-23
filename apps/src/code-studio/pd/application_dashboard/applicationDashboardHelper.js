import {mapValues, omit, filter} from 'lodash';

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
// }
// and is used for the "Summary" component on the Application Dashboard.
// Anyone who is not a workshop admin should not see incomplete data, so we strip it here.
export const removeIncompleteAppsFromSummaryView = data =>
  mapValues(data, data_by_status => omit(data_by_status, ['incomplete']));

// Returns a new array of the form
// [
//   {
//      applicant_name: "Severus",
//      id: 30,
//      status: "unreviewed"
//   },
//   {
//      applicant_name: "Jenny",
//      id: 13,
//      status: "withdrawn"
//   }
// ]
// The `applications` come in from
// /api/v1/pd/applications/quick_view?role=:role&regional_partner_filter=:regional_partner_filter
// with the shape
// applications = [
//   {
//      applicant_name: "Severus",
//      id: 30,
//      status: "unreviewed"
//   },
//   {
//      applicant_name: "Harry",
//      id: 16,
//      status: "incomplete"
//   },
//   {
//      applicant_name: "Jenny",
//      id: 13,
//      status: "withdrawn"
//   }
// ]
// and is used for the "QuickView" on the Application Dashboard.
// Anyone who is not a workshop admin should not see incomplete applications, so we strip them here.
export const removeIncompleteAppsFromQuickView = applications =>
  filter(applications, application => application.status !== 'incomplete');
