import type {Environment} from '../environment';

export function getDashboardApiUrl(environment: Environment): string {
  switch (environment) {
    case 'development':
      return 'http://localhost-studio.code.org:3000';
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
