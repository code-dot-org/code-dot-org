import msg from '@cdo/javalab/locale';

// Common utilities for Java Lab

export function getUnsupportedMiniAppMessage(miniAppType) {
  return msg.unsupportedMiniAppMessage({
    // Capitalize first letter of mini-app name (e.g. neighborhood -> Neighborhood)
    miniAppType: miniAppType.charAt(0).toUpperCase() + miniAppType.slice(1),
  });
}
