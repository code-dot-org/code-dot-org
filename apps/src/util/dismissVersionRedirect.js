const dismissVersionRedirect = module.exports;

// A session variable storing a comma-delimited list of course/script names for which:
// ...the user has already dismissed the version redirect warning.
const DISMISSED_REDIRECT_WARNINGS_SESSION_KEY = 'dismissedRedirectWarnings';
// ...the user has already dismissed the version redirect dialog (<RedirectDialog/> component).
const DISMISSED_REDIRECT_DIALOGS_SESSION_KEY = 'dismissedRedirectDialogs';

dismissVersionRedirect.dismissedRedirect = function (sessionKey, name) {
  const dismissedRedirects = sessionStorage.getItem(sessionKey);
  return (dismissedRedirects || '').includes(name);
};

dismissVersionRedirect.dismissedRedirectWarning = function (name) {
  return this.dismissedRedirect(DISMISSED_REDIRECT_WARNINGS_SESSION_KEY, name);
};

dismissVersionRedirect.dismissedRedirectDialog = function (name) {
  return this.dismissedRedirect(DISMISSED_REDIRECT_DIALOGS_SESSION_KEY, name);
};

dismissVersionRedirect.onDismissRedirect = function (sessionKey, name) {
  let dismissedRedirects = sessionStorage.getItem(sessionKey);
  if (dismissedRedirects) {
    dismissedRedirects += `,${name}`;
  } else {
    dismissedRedirects = name;
  }
  sessionStorage.setItem(sessionKey, dismissedRedirects);
};

dismissVersionRedirect.onDismissRedirectWarning = function (name) {
  return this.onDismissRedirect(DISMISSED_REDIRECT_WARNINGS_SESSION_KEY, name);
};

dismissVersionRedirect.onDismissRedirectDialog = function (name) {
  return this.onDismissRedirect(DISMISSED_REDIRECT_DIALOGS_SESSION_KEY, name);
};
