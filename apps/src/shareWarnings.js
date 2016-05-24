var utils = require('./utils');
var ShareWarningsDialog = require('./templates/ShareWarningsDialog');

function hasSeenDataAlert(channelId) {
  var dataAlerts = localStorage.getItem('dataAlerts');
  if (!dataAlerts) {
    return false;
  }
  var channelIds = JSON.parse(dataAlerts);
  return channelIds.indexOf(channelId) !== -1;
}

function markSeenDataAlert(channelId) {
  var dataAlerts = localStorage.getItem('dataAlerts');
  if (!dataAlerts) {
    dataAlerts = '[]';
  }
  var channelIds = JSON.parse(dataAlerts);
  channelIds.push(channelId);
  localStorage.setItem('dataAlerts', JSON.stringify(channelIds));
}

/**
 * Handle completion of the warning dialog
 *
 * @param {!boolean} showedStoreDataAlert - was the data store alert shown.
 * @param {!Object} options
 * @param {!string} options.channelId - service side channel.
 * @param {!boolean} options.isSignedIn - login state of current user.
 * @param {function} options.onWarningsComplete - Callback will be called after
 *        the modal warnings is dismissed. Will also be called if the modal
 *        warning is deemed to not be necessary.
 */
function onCloseShareWarnings(showedStoreDataAlert, options) {
  // we closed the dialog without hitting too_young
  // Only want to ask about age once across apps
  if (!options.isSignedIn) {
    utils.trySetLocalStorage('is13Plus', 'true');
  }
  // Only want to ask about storing data once per app.
  if (showedStoreDataAlert) {
    markSeenDataAlert(options.channelId);
  }
  if (options.onWarningsComplete) {
    options.onWarningsComplete();
  }
}

function handleShareWarningsTooYoung(onTooYoung) {
  utils.trySetLocalStorage('is13Plus', 'false');
  if (onTooYoung) {
    onTooYoung();
  } else {
    window.location.href = '/too_young';
  }
}

/**
 * When necessary, show a modal warning about data sharing (if appropriate) and
 * determining if the user is old enough.
 *
 * @param {!Object} options
 * @param {!string} options.channelId - service side channel.
 * @param {!boolean} options.isSignedIn - login state of current user.
 * @param {!boolean} options.is13Plus - age state of current user (if signed in).
 * @param {function} options.hasDataAPIs - Function to call to determine if
 *        the current program uses any data APIs.
 * @param {function} options.onWarningsComplete - Callback will be called after
 *        the modal warnings is dismissed. Will also be called if the modal
 *        warning is deemed to not be necessary.
 * @param {function} options.onTooYoung - Callback will be called if the user
 *        is deemed to be too young. If not specified, the page will be
 *        redirected to /too_young
 */
exports.checkSharedAppWarnings = function (options) {
  var handleTooYoung = handleShareWarningsTooYoung.bind(null, options.onTooYoung);
  // dashboard will redirect young signed in users unless they are on an iframe
  // embed, so we will redirect them if they got here somehow
  var is13Plus = (options.isSignedIn && options.is13Plus) ||
                  localStorage.getItem('is13Plus') === "true";

  var showStoreDataAlert = (options.hasDataAPIs && options.hasDataAPIs()) &&
      !hasSeenDataAlert(options.channelId);
  // Ensure the property is true or false and not undefined.
  showStoreDataAlert = !!showStoreDataAlert;

  var modal = document.createElement('div');
  document.body.appendChild(modal);

  return ReactDOM.render(
      <ShareWarningsDialog
          showStoreDataAlert={showStoreDataAlert}
          is13Plus={is13Plus}
          handleClose={onCloseShareWarnings.bind(null, showStoreDataAlert, options)}
          handleTooYoung={handleTooYoung}/>,
    modal
  );
};
