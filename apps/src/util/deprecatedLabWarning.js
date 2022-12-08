export var showDeprecatedLabWarning = function(labName) {
  if (labName === 'calc' || labName === 'eval') {
    $('#calc-eval-deprecated').show();
    $('#warning-icon').show();
    $('#dismiss-icon').show();
    $('#warning-banner').show();
  }
};
