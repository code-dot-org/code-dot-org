import type {Environment} from './environment';
import {parse} from 'tldjs';

/**
 * Get the current environment.
 * @returns The current environment based on the window's hostname.
 */
export function getEnvironmentFromHostname(): Environment {
  const fullHostname = window.location.hostname;
  const parsedHostname = parse(fullHostname);
  const subdomain = parsedHostname.subdomain || '';
  const hostname = parsedHostname.hostname || '';

  // As adhoc hostnames may include other keywords, check it first.
  if (subdomain.includes('adhoc')) {
    return 'adhoc';
  }

  if (subdomain.includes('test')) {
    return 'test';
  }

  if (subdomain.includes('levelbuilder')) {
    return 'levelbuilder';
  }

  if (subdomain.includes('staging')) {
    return 'staging';
  }

  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return 'development';
  }

  if (fullHostname === 'studio.code.org') {
    return 'production';
  }

  return 'development';
}
