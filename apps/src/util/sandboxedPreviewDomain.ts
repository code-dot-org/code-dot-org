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
