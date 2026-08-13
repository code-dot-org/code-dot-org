import DCDO from '@cdo/apps/dcdo';
import experiments from '@cdo/apps/util/experiments';

// Whether Python Lab runs pyodide in a hidden iframe on the sandboxed preview
// domain rather than directly on studio.code.org (see README.md). Either the
// 'use-pythonlab-separate-domain' DCDO flag (per-environment rollout and
// rollback, no deploy needed) or a per-session experiment turns it on; only a
// DCDO value of exactly true counts, so a stray string or number can't enable
// it. The experiments stay independent of the flag so a session can opt in
// while the flag is off.
export function isPyodideSandboxEnabled(): boolean {
  return (
    DCDO.get('use-pythonlab-separate-domain', false) === true ||
    experiments.isEnabledAllowingQueryString(
      experiments.PYTHONLAB_SEPARATE_DOMAIN
    ) ||
    experiments.isEnabledAllowingQueryString(experiments.NEW_PREVIEW_DOMAIN)
  );
}
