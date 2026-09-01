import {proposeCatalog, type ProposeCatalogInput, type ProposeCatalogResult} from './catalogTarget.js';
import {proposeStaffApps, type ProposeStaffAppsInput, type ProposeStaffAppsResult} from './staffAppsTarget.js';

export type ProposeWidgetInput = ProposeCatalogInput | ProposeStaffAppsInput;
export type ProposeWidgetResult = ProposeCatalogResult | ProposeStaffAppsResult;

/**
 * Graduates a session widget into a real pull request. `input.target`
 * picks which repo it lands in and how — see `catalogTarget.ts` (the
 * monorepo's own `widgets-catalog` package, source-only, CI-built, never
 * opens a PR itself) and `staffAppsTarget.ts` (`codeai-staff-apps/widgets`,
 * built artifacts committed, opens a PR when it can). Both share every
 * other piece of this flow: the contract-gate pre-flight below, the
 * manifest shape, `PROVENANCE.md`, and the git plumbing that never touches
 * a caller's working tree.
 *
 * One propose endpoint (authoring-service) and one CLI (`widgets:propose`)
 * both call this — see this package's README for why that matters for
 * `docHash`/`sourceHash` reproducibility never disagreeing between them.
 */
export async function proposeWidget(
  input: ProposeWidgetInput,
): Promise<ProposeWidgetResult> {
  if (input.violations.length > 0) {
    return {
      ok: false,
      reason: 'widget document fails one or more contract gates',
      violations: input.violations,
    };
  }

  if (input.target === 'catalog') {
    return proposeCatalog(input);
  }
  return proposeStaffApps(input);
}

export {proposeCatalog, type ProposeCatalogInput, type ProposeCatalogResult};
export {proposeStaffApps, type ProposeStaffAppsInput, type ProposeStaffAppsResult};
