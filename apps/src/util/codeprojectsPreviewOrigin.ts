// Loaded by the sandboxed preview pages themselves, whose bundles carry none of
// studio.code.org's page globals -- keep this module free of imports.

// Pages served from a dedicated *.preview.codeaiprojects.org (or pre-migration
// *.preview.codeprojects.org) subdomain (Web Lab 2's HTML preview, Python Lab's
// pyodide sandbox) are isolated from studio.code.org's cookies/session, but
// still need to compute the studio.code.org origin they were loaded from, to
// validate and address postMessages back to their parent. Derived from
// location.hostname rather than the DCDO flag, so a page keeps working on
// whichever domain served it.
export function getOuterOrigin() {
  const regex = /[^.]+\.preview\.([^.]+)\.code(?:ai)?projects\.org/;
  const match = location.hostname.match(regex);
  const environment = match && match[1] ? `${match[1]}-` : '';
  const port =
    'localhost-' === environment && location.port ? `:${location.port}` : '';
  const cdn = environment.includes('adhoc') ? 'cdn-' : '';
  return `${location.protocol}//${environment}studio.${cdn}code.org${port}`;
}

// The reverse direction: from studio.code.org, work out which environment
// (dev/adhoc/prod) and port a child preview subdomain should use, so it
// resolves to the same environment as the current page. Callers combine this
// with their own subdomain prefix (e.g. a fixed name, or a per-level/channel
// name) and getPreviewDomain() to build the full URL.
export function getInnerEnvironment() {
  const re = /([-.]?studio)?\.?(cdn-)?code.org/i;
  const environmentKey = location.hostname.replace(re, '');
  const subdomain = environmentKey.length > 0 ? `${environmentKey}.` : '';
  const isLocalhost = environmentKey === 'localhost';
  const port = isLocalhost && location.port ? `:${location.port}` : '';
  return {subdomain, isLocalhost, port};
}
