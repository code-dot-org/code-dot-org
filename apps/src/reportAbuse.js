import cookies from 'js-cookie';

/**
 * Determines if the current user has already submitted an Abuse report for this project.
 * @returns {boolean} true if the user has reported the given project for abuse.
 */
export const userAlreadyReportedAbuse = function (channelId) {
  return (
    cookies.get('reported_abuse') &&
    JSON.parse(cookies.get('reported_abuse')).includes(channelId)
  );
};

/**
 * Extracts a channel id from the given abuse url
 * @returns {string} Channel id, or undefined if we can't get one.
 */
export const getChannelIdFromUrl = function (abuseUrl) {
  let match;
  if (abuseUrl.indexOf('codeprojects') >= 0 && abuseUrl.indexOf('weblab') < 0) {
    match = /.*codeprojects.*[^\/]+\/([^\/]+)/.exec(abuseUrl);
  } else if (abuseUrl.indexOf('channelId=') >= 0) {
    match = /\?channelId=(.*)/.exec(abuseUrl);
  } else {
    match = /.*\/projects\/[^\/]+\/([^\/]+)/.exec(abuseUrl);
  }
  return match && match[1];
};
