import type {Environment} from '../environment';

type LocationLike = Pick<Location, 'hostname' | 'origin'>;

export function getDashboardApiUrl(
  environment: Environment,
  location?: LocationLike,
): string {
  switch (environment) {
    case 'adhoc': {
      const currentLocation =
        location ??
        (typeof window === 'undefined' ? undefined : window.location);
      if (!currentLocation) {
        throw new Error('The adhoc environment requires a browser location');
      }
      return currentLocation.origin;
    }
    case 'development': {
      const currentLocation =
        location ??
        (typeof window === 'undefined' ? undefined : window.location);
      return currentLocation?.hostname === 'localhost-studio.code.org'
        ? currentLocation.origin
        : 'http://localhost-studio.code.org:3000';
    }
    case 'staging':
      return 'https://staging-studio.code.org';
    case 'levelbuilder':
      return 'https://levelbuilder-studio.code.org';
    case 'test':
      return 'https://test-studio.code.org';
    case 'production':
      return 'https://studio.code.org';
    default:
      throw new Error(`Unknown environment: ${environment}`);
  }
}
