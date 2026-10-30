import testImageAccess from '@cdo/apps/code-studio/url_test';
import youTubeAvailabilityEndpointURL from '@cdo/apps/code-studio/youTubeAvailabilityEndpointURL';

export default function testYouTubeAvailable(
  noCookie: boolean,
  callback: (result: boolean) => void
) {
  testImageAccess(
    youTubeAvailabilityEndpointURL(noCookie) + '?' + Math.random(),
    // Called when YouTube availability check succeeds.
    () => callback(true),
    // Called when YouTube availability check fails.
    () => callback(false)
  );
}
