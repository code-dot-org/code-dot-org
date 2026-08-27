import DCDO from '@cdo/apps/dcdo';
import experiments from '@cdo/apps/util/experiments';

// Whether Python Lab runs pyodide in a hidden iframe on the sandboxed preview
// domain rather than directly on studio.code.org (see README.md).
export function isPyodideSandboxEnabled(): boolean {
  return (
    DCDO.get('use-pythonlab-separate-domain', false) === true ||
    experiments.isEnabledAllowingQueryString(
      experiments.PYTHONLAB_SEPARATE_DOMAIN
    ) ||
    experiments.isEnabledAllowingQueryString(experiments.NEW_PREVIEW_DOMAIN)
  );
}
