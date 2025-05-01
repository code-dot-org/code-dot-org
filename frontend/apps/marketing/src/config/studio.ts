import {getStage} from './stage';

export function getStudioUrl() {
  switch (getStage()) {
    case 'development':
    case 'pr':
      return 'http://localhost-studio.code.org:3000';
    case 'test':
      return 'https://test-studio.code.org';
    case 'production':
    default:
      return 'https://studio.code.org';
  }
}
