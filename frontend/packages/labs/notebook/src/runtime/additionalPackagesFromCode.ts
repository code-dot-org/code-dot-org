/**
 * Ported from jupyter-k12 (MIT, Simon Guest). Adapted for @code-dot-org/notebook-lab.
 *
 * Maps Python import names to wheel/package URLs that Pyodide's built-in
 * import scanner does not resolve automatically.  The worker calls this before
 * `loadPackagesFromImports` so that packages like `chess` (distributed as a
 * wheel) are available when the user's code runs.
 */

/**
 * Returns the URL string for a pyodide-hosted package file.
 * Dev server serves assets from /pyodide/; production assets sit adjacent to
 * the worker bundle at ../pyodide/ relative to the worker script URL.
 * @param pkg Filename within the pyodide assets directory
 * @returns Absolute URL string for use with loadPackage
 */
const getURL = (pkg: string): string => {
  // @ts-ignore — import.meta.env is injected by Vite
  if (import.meta.env.DEV) {
    return new URL(/* @vite-ignore */ `/pyodide/${pkg}`, import.meta.url).toString();
  } else {
    return new URL(/* @vite-ignore */ `../pyodide/${pkg}`, import.meta.url).toString();
  }
};

/**
 * Maps Python top-level import names to lists of package URLs that must be
 * loaded before the import succeeds.  Extend this map when adding new
 * allow-listed packages to the lab's Python surface.
 */
const importToPackageMap: Record<string, string[]> = {
  chess: [getURL('chess-1.10.0-py3-none-any.whl')],
};

/**
 * Scans `code` for top-level import statements and returns the list of
 * additional package URLs that must be loaded via `pyodide.loadPackage` before
 * execution.  Only packages in `importToPackageMap` are returned; everything
 * else is expected to be handled by `pyodide.loadPackagesFromImports`.
 * @param code Python source code string
 * @returns Array of package URLs (may be empty)
 */
export const additionalPackagesFromCode = (code: string): string[] => {
  const packages: string[] = [];
  let match: RegExpExecArray | null;

  const importRegex =
    /^\s*import\s+(\w+)(?:\s+as\s+\w+)?(?:\s*,\s*(\w+)(?:\s+as\s+\w+)?)*|^\s*from\s+(\w+)(?:\.\w+)*\s+import/gm;
  const importedModules = new Set<string>();

  while ((match = importRegex.exec(code)) !== null) {
    if (match[1]) {
      importedModules.add(match[1]);

      if (match[2]) {
        const additionalImports = match[2].split(',').map(m => m.trim());
        for (const importName of additionalImports) {
          if (importName) importedModules.add(importName);
        }
      }
    }

    if (match[3]) {
      importedModules.add(match[3]);
    }
  }

  for (const importedModule of importedModules) {
    const packageNames = importToPackageMap[importedModule];
    if (packageNames !== undefined) {
      for (const packageName of packageNames) {
        if (!packages.includes(packageName)) {
          packages.push(packageName);
        }
      }
    }
  }

  return packages;
};
