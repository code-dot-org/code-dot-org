import {ABSOLUTE_REGEXP} from '@cdo/apps/assetManagement/assetPrefix';
import {moderateImageUrl} from '@cdo/apps/util/moderateImage';

const HTTP_URL_PREFIX_REGEX = /^http:\/\//i;
const MODERATION_STATUSES = ['safe', 'flagged', 'error'];

export function isAbsoluteImageUrl(imageUrl) {
  return ABSOLUTE_REGEXP.test(imageUrl);
}

function getModerationStatusOverride() {
  if (window.dashboard?.rack_env !== 'test') {
    return null;
  }

  const override = window.__applabImageModerationStatusOverride;
  return MODERATION_STATUSES.includes(override) ? override : null;
}

export async function moderateApplabImageUrl(
  imageUrl,
  {allowTestOverride = false} = {}
) {
  if (!isAbsoluteImageUrl(imageUrl)) {
    return {status: 'invalid-url'};
  }

  const normalizedUrl = imageUrl.replace(HTTP_URL_PREFIX_REGEX, 'https://');
  const overrideStatus = allowTestOverride
    ? getModerationStatusOverride()
    : null;
  if (overrideStatus !== null) {
    return {status: overrideStatus, normalizedUrl};
  }

  const status = await moderateImageUrl(normalizedUrl, 'applab', {
    uploaderType: 'ImageURLInput',
    assetUrl: normalizedUrl,
  });

  return {status, normalizedUrl};
}
