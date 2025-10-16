import DCDO from '@cdo/apps/dcdo';
import statsigReporter from '@cdo/apps/metrics/StatsigReporter';

const NETWORK_AVAILABILITY_EVENT = 'Remote Network Availability Check';

interface DetectNetworkConfig {
  url: string;
  sampleRate: number;
}

/**
 * Returns true if network detection is enabled for the given teacherId and config.
 * @param teacherId The teacher's user ID.
 * @param config The DetectNetworkConfig object from DCDO.
 * @returns true if network detection is enabled, false otherwise.
 */
function isDetectNetworkEnabled(
  teacherId: number,
  config: DetectNetworkConfig
): boolean {
  if (
    !config ||
    config.url === undefined ||
    config.sampleRate === undefined ||
    // covers both null and undefined
    // eslint-disable-next-line eqeqeq
    teacherId == undefined
  ) {
    return false;
  }

  const sampleRate = config.sampleRate;
  const userBucket = teacherId % 100;

  return userBucket < sampleRate;
}

/**
 * Detects network availability by attempting to load an image from a remote URL.
 * Sends an analytics event with the result: 'available', 'error', or 'abort'.
 * @param teacherId The teacher's user ID.
 */
export function detectNetworkAvailability(teacherId: number) {
  const config = DCDO.get(
    'detect-remote-network-config'
  ) as DetectNetworkConfig;

  if (!isDetectNetworkEnabled(teacherId, config)) {
    return;
  }

  const img = new Image();
  img.onload = () =>
    statsigReporter.sendEvent(NETWORK_AVAILABILITY_EVENT, {
      network: 'available',
    });

  img.onerror = () =>
    statsigReporter.sendEvent(NETWORK_AVAILABILITY_EVENT, {
      network: 'error',
    });

  img.onabort = () =>
    statsigReporter.sendEvent(NETWORK_AVAILABILITY_EVENT, {
      network: 'abort',
    });

  img.src = config.url;
}
