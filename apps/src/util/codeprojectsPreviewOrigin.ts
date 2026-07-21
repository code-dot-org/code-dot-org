// Pages served from a dedicated *.preview.codeprojects.org subdomain (Web Lab 2's
// HTML preview, Python Lab's pyodide sandbox) are isolated from studio.code.org's
// cookies/session, but still need to compute the studio.code.org origin they were
// loaded from, to validate and address postMessages back to their parent.
export function getOuterOrigin() {
  const regex = /[^.]+\.preview\.([^.]+)\.codeprojects\.org/;
  const match = location.hostname.match(regex);
  const environment = match && match[1] ? `${match[1]}-` : '';
  const port =
    'localhost-' === environment && location.port ? `:${location.port}` : '';
  const cdn = environment.includes('adhoc') ? 'cdn-' : '';
  return `${location.protocol}//${environment}studio.${cdn}code.org${port}`;
}

// The reverse direction: from studio.code.org, work out which environment
// (dev/adhoc/prod) and port a child *.preview.codeprojects.org subdomain should
// use, so it resolves to the same environment as the current page. Callers combine
// this with their own subdomain prefix (e.g. a fixed name, or a per-level/channel
// name) to build the full URL.
export function getInnerEnvironment() {
  const re = /([-.]?studio)?\.?(cdn-)?code.org/i;
  const environmentKey = location.hostname.replace(re, '');
  const subdomain = environmentKey.length > 0 ? `${environmentKey}.` : '';
  const isLocalhost = environmentKey === 'localhost';
  const port = isLocalhost && location.port ? `:${location.port}` : '';
  return {subdomain, isLocalhost, port};
}
