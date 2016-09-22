import {
  showStartOverDialog,
  showInstructionsDialog,
  processResults
} from  './dialogHelper';

window.dashboard = window.dashboard || {};
// These are placed on the dashboard namespace, as they are still used by some
// files in dashboard/public
window.dashboard.dialog = {
  showStartOverDialog: showStartOverDialog,
  showInstructionsDialog: showInstructionsDialog,
  processResults: processResults
};
