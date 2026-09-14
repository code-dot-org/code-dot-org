import {
  ABSOLUTE_CDO_IMAGES_REGEXP,
  ABSOLUTE_REGEXP,
} from '@cdo/apps/assetManagement/assetPrefix';
import {moderateImageUrl} from '@cdo/apps/util/moderateImage';

import {normalizeToHttps} from './imageUrlUtils';

const MODERATION_STATUSES = ['safe', 'flagged', 'error'];

// Student APIs (setImageURL, drawImageURL, timedLoop, ...) can moderate the
// same URL many times per second. Cache results until reload; share one
// in-flight request per URL.
const statusCache = new Map();
const inflightRequests = new Map();

// After a failed check, skip re-asking Azure for this URL for 10 seconds.
export const ERROR_CACHE_DURATION_MS = 10 * 1000;

export function isAbsoluteImageUrl(imageUrl) {
  return ABSOLUTE_REGEXP.test(imageUrl);
}

export function clearImageUrlModerationCache() {
  statusCache.clear();
  inflightRequests.clear();
}

function getCachedStatus(normalizedUrl) {
  const entry = statusCache.get(normalizedUrl);
  if (!entry) {
    return null;
  }
  if (entry.expiresAt !== undefined && Date.now() > entry.expiresAt) {
    statusCache.delete(normalizedUrl);
    return null;
  }
  return entry.status;
}

function setCachedStatus(normalizedUrl, status) {
  if (status === 'safe' || status === 'flagged') {
    statusCache.set(normalizedUrl, {status});
    return;
  }
  if (status === 'error') {
    statusCache.set(normalizedUrl, {
      status,
      expiresAt: Date.now() + ERROR_CACHE_DURATION_MS,
    });
  }
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

  const normalizedUrl = normalizeToHttps(imageUrl);
  // Levelbuilder-only bucket; students cannot upload here.
  if (ABSOLUTE_CDO_IMAGES_REGEXP.test(normalizedUrl)) {
    return {status: 'safe', normalizedUrl};
  }

  const overrideStatus = allowTestOverride
    ? getModerationStatusOverride()
    : null;
  if (overrideStatus !== null) {
    return {status: overrideStatus, normalizedUrl};
  }

  const cachedStatus = getCachedStatus(normalizedUrl);
  if (cachedStatus !== null) {
    return {status: cachedStatus, normalizedUrl};
  }

  let pending = inflightRequests.get(normalizedUrl);
  if (!pending) {
    pending = moderateImageUrl(normalizedUrl, 'applab', {
      uploaderType: 'ImageURLInput',
      assetUrl: normalizedUrl,
    })
      .then(status => {
        setCachedStatus(normalizedUrl, status);
        return status;
      })
      .finally(() => {
        inflightRequests.delete(normalizedUrl);
      });
    inflightRequests.set(normalizedUrl, pending);
  }

  const status = await pending;
  return {status, normalizedUrl};
}
