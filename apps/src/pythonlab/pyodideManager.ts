import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import experiments from '@cdo/apps/util/experiments';

import {PyodideMessage} from './types';

// Decides once, at load time, whether Python Lab runs the pyodide worker directly on
// studio.code.org (today's default) or isolated in a hidden iframe on a separate
// sandboxed-preview domain (see apps/src/pythonlab/README.md). Loaded dynamically so
// only the selected implementation's module-scope startup work -- creating a real
// Worker, or creating the sandbox iframe -- ever runs; statically importing both would
// run both unconditionally regardless of the experiment.
// 'new-preview-domain' only selects which domain previews are served from, so it also
// turns the sandbox on here; otherwise it would be a no-op in Python Lab and testing
// the new domain would take two flags.
const usePyodideSandbox =
  experiments.isEnabledAllowingQueryString(
    experiments.PYTHONLAB_SEPARATE_DOMAIN
  ) || experiments.isEnabledAllowingQueryString(experiments.NEW_PREVIEW_DOMAIN);
// TS wants an explicit extension on dynamic imports under our node16
// moduleResolution, but these are .ts files, not .js -- webpack resolves the
// extensionless specifier directly, so we suppress the checker here instead.
const managerPromise = usePyodideSandbox
  ? // @ts-expect-error see comment above
    import('./pyodideSandboxManager')
  : // @ts-expect-error see comment above
    import('./pyodideWorkerManager');

export async function asyncRun(
  script: string,
  source: MultiFileSource,
  validationFile?: ProjectFile,
  shouldOutputToNeighborhood?: boolean
): Promise<PyodideMessage> {
  const manager = await managerPromise;
  return manager.asyncRun(
    script,
    source,
    validationFile,
    shouldOutputToNeighborhood
  );
}

export async function restartPyodideIfProgramIsRunning(): Promise<void> {
  const manager = await managerPromise;
  manager.restartPyodideIfProgramIsRunning();
}

export async function sendInput(value: string): Promise<void> {
  const manager = await managerPromise;
  manager.sendInput(value);
}
