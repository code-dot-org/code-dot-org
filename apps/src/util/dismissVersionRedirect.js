// A session variable storing a comma-delimited list of course/script names for which:
// ...the user has already dismissed the version redirect warning.
const DISMISSED_REDIRECT_WARNINGS_SESSION_KEY = 'dismissedRedirectWarnings';
// ...the user has already dismissed the version redirect dialog (<RedirectDialog/> component).
const DISMISSED_REDIRECT_DIALOGS_SESSION_KEY = 'dismissedRedirectDialogs';

export const dismissedRedirect = (sessionKey, name) => {
  const dismissedRedirects = sessionStorage.getItem(sessionKey);
  return (dismissedRedirects || '').split(',').includes(name);
};

export const dismissedRedirectWarning = name => {
  return dismissedRedirect(DISMISSED_REDIRECT_WARNINGS_SESSION_KEY, name);
};

export const dismissedRedirectDialog = name => {
  return dismissedRedirect(DISMISSED_REDIRECT_DIALOGS_SESSION_KEY, name);
};

export const onDismissRedirect = (sessionKey, name) => {
  let dismissedRedirects = sessionStorage.getItem(sessionKey);
  if (dismissedRedirects) {
    dismissedRedirects += `,${name}`;
  } else {
    dismissedRedirects = name;
  }
  sessionStorage.setItem(sessionKey, dismissedRedirects);
};

export const onDismissRedirectWarning = name => {
  return onDismissRedirect(DISMISSED_REDIRECT_WARNINGS_SESSION_KEY, name);
};

export const onDismissRedirectDialog = name => {
  return onDismissRedirect(DISMISSED_REDIRECT_DIALOGS_SESSION_KEY, name);
};
