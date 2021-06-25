const SUPPORT_ARTICLE_URL =
  'https://support.code.org/hc/en-us/articles/360016804871';

const SUPPORT_ARTICLE_HTML = `<div>Please see our support article <a href="${SUPPORT_ARTICLE_URL}">"Troubleshooting Web Lab problems"</a> for more information.</div>`;

export const LOAD_FAILURE_MESSAGE = `We're sorry, Web Lab failed to load for some reason. ${SUPPORT_ARTICLE_HTML}`;

export const fatalErrorMessage = message =>
  `Fatal Error: ${message}. If you're in Private Browsing mode, data can't be written. ${SUPPORT_ARTICLE_HTML}`;

export const resetFailedMessage = message =>
  `Failed to reset Web Lab: ${message}. ${SUPPORT_ARTICLE_HTML}`;
