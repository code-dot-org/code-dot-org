import type {WorkerFile} from './messages';
import type {PyodideRuntime} from './pyodideRuntime';

// The runtime façade. Picks, once, whether Python Lab runs the pyodide worker
// directly on this page (today's default) or isolated in an iframe on a separate
// origin. The rest of the lab (pythonRunner) talks only to this module.
//
// studio makes this choice with the PYTHONLAB_SEPARATE_DOMAIN experiment and a
// fixed codeprojects subdomain. This package instead reads the sandbox page URL
// from a query param, so the host names the origin — e.g.
//   ?pyodide-sandbox=http://localhost:5200/sandbox.html
// When the param is absent, the worker runs directly. (Pattern borrowed from the
// caturra project, which passes its sandbox location the same way.)

/** Query param whose value is the sandbox page URL. */
export const SANDBOX_URL_PARAM = 'pyodide-sandbox';

/** Read the sandbox URL out of a `location.search` string; null if unset/empty. */
export function parseSandboxUrl(search: string): string | null {
  const value = new URLSearchParams(search).get(SANDBOX_URL_PARAM);
  return value ? value : null;
}

function getSandboxUrl(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return parseSandboxUrl(window.location.search);
}

// Load only the selected backend's module: importing the sandbox manager creates
// an iframe, and we never want both backends' module-scope startup to run. Built
// once, lazily, on first use (preload at mount, or first run).
let runtimePromise: Promise<PyodideRuntime> | null = null;

function getRuntime(): Promise<PyodideRuntime> {
  if (!runtimePromise) {
    const sandboxUrl = getSandboxUrl();
    runtimePromise = sandboxUrl
      ? import('./sandbox/pyodideSandboxManager').then(m =>
          m.createSandboxRuntime(sandboxUrl),
        )
      : import('./pyodideWorkerManager').then(m => m.createWorkerRuntime());
  }
  return runtimePromise;
}

export async function preloadPyodide(): Promise<void> {
  (await getRuntime()).preloadPyodide();
}

export async function asyncRun(
  python: string,
  files: WorkerFile[],
): Promise<void> {
  return (await getRuntime()).asyncRun(python, files);
}

export async function restartWorkerIfRunning(): Promise<void> {
  (await getRuntime()).restartWorkerIfRunning();
}

export async function sendInput(value: string): Promise<void> {
  (await getRuntime()).sendInput(value);
}
