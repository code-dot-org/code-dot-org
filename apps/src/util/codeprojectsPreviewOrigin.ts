import DCDO from '@cdo/apps/dcdo';

// Apex domains that may host the sandboxed preview origin. codeaiprojects.org
// is the default; codeprojects.org is the pre-migration domain, kept servable
// so the DCDO flag below can revert the cutover without a deploy. See
// docs/weblab-preview-domain-migration.md.
const PREVIEW_DOMAINS = ['codeaiprojects.org', 'codeprojects.org'];
const DEFAULT_PREVIEW_DOMAIN = PREVIEW_DOMAINS[0];

// The apex domain to build preview origins on, switchable at runtime via the
// 'sandboxed-preview-domain' DCDO flag. Values outside PREVIEW_DOMAINS fall
// back to the default, so a bad flag value can't point previews at an
// arbitrary domain.
export function getPreviewDomain(): string {
  const domain = DCDO.get('sandboxed-preview-domain', DEFAULT_PREVIEW_DOMAIN);
  return typeof domain === 'string' && PREVIEW_DOMAINS.includes(domain)
    ? domain
    : DEFAULT_PREVIEW_DOMAIN;
}

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
