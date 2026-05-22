/**
 * Ported from jupyter-k12 (MIT, Simon Guest). Adapted for @code-dot-org/notebook-lab.
 *
 * Post-load Python overrides for packages whose default behaviours are
 * incompatible with the in-browser, headless execution model (e.g. matplotlib
 * must render to a buffer rather than an X display; pygame-ce must draw to an
 * off-screen surface rather than a window).
 *
 * Each override is a .py file colocated in this directory that patches the
 * relevant package globals after it has been loaded by Pyodide.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Configuration entry for a single package override.
 * `file` defaults to `module` when absent.
 */
interface OverrideConfig {
  /** Pyodide package name as returned by loadPackage. */
  module: string;
  /** Python packages that must be loaded before the override runs. */
  dependencies?: string[];
  /**
   * Override Python filename (without .py) in this directory.
   * Defaults to `module` when absent.
   */
  file?: string;
}

// ---------------------------------------------------------------------------
// Override registry
// ---------------------------------------------------------------------------

/**
 * All packages that have runtime overrides registered for this lab.
 * Order is not significant; overrides are applied per-package after load.
 */
export const overrides: OverrideConfig[] = [
  {
    module: 'matplotlib',
    dependencies: [],
  },
  {
    module: 'pygame-ce',
    dependencies: ['pillow'],
  },
];

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

/**
 * Fetches and executes the Python override for the given package module.
 * Loads any declared dependencies first via pyodide.loadPackage.
 * No-ops with a console warning when no override is registered for `module`.
 * @param pyodide Live pyodide instance (typed as any — no @types/pyodide)
 * @param module Package name matching an entry in `overrides`
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const implementOverride = async (pyodide: any, module: string): Promise<void> => {
  const overrideConfig = overrides.find(config => config.module === module);

  if (!overrideConfig) {
    console.warn(`implementOverride: no override registered for module: ${module}`);
    return;
  }

  if (overrideConfig.dependencies && overrideConfig.dependencies.length > 0) {
    console.log(`implementOverride: loading dependencies for ${module}:`, overrideConfig.dependencies);
    await pyodide.loadPackage(overrideConfig.dependencies);
  }

  const fileName = overrideConfig.file ?? module;
  const response = await fetch(new URL(`./${fileName}.py`, import.meta.url));
  const code = await response.text();
  await pyodide.runPythonAsync(code);
};
