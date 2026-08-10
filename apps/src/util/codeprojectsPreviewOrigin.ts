import DCDO from '@cdo/apps/dcdo';
import experiments from '@cdo/apps/util/experiments';

// Apex domains that may host the sandboxed preview origin. The server serves
// both; codeaiprojects.org is the migration target, codeprojects.org the
// pre-migration domain and the default until the new domain has been bug
// bashed in production. See docs/weblab-preview-domain-migration.md.
const NEW_PREVIEW_DOMAIN = 'codeaiprojects.org';
const LEGACY_PREVIEW_DOMAIN = 'codeprojects.org';
const PREVIEW_DOMAINS = [NEW_PREVIEW_DOMAIN, LEGACY_PREVIEW_DOMAIN];
const DEFAULT_PREVIEW_DOMAIN = LEGACY_PREVIEW_DOMAIN;

// The apex domain to build preview origins on. Precedence: the
// 'new-preview-domain' experiment (per-session opt-in for bug bashes, e.g.
// ?enableExperiments=new-preview-domain), then the 'sandboxed-preview-domain'
// DCDO flag (per-environment rollout and rollback, no deploy needed), then the
// default. Flag values outside PREVIEW_DOMAINS fall back to the default, so a
// bad flag value can't point previews at an arbitrary domain.
export function getPreviewDomain(): string {
  if (
    experiments.isEnabledAllowingQueryString(experiments.NEW_PREVIEW_DOMAIN)
  ) {
    return NEW_PREVIEW_DOMAIN;
  }
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
