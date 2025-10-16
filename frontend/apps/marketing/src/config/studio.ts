import {getStage} from './stage';

export function getStudioBaseUrl() {
  if (
    typeof window !== 'undefined' &&
    window.location.hostname === 'levelbuilder.code.org'
  ) {
    return 'https://levelbuilder-studio.code.org';
  }

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

export function getStudioUrl(path = '') {
  const studioBaseUrl = getStudioBaseUrl();
  return path ? new URL(path, studioBaseUrl).toString() : studioBaseUrl;
}
