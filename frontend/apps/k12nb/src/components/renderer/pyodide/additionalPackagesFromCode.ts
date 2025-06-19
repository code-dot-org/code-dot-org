const getURL = (pkg: string) => {
  if (process.env.NODE_ENV === 'development') {
    // Local dev server
    return `/pyodide/${pkg}`;
  } else {
    // Production
    return `/pyodide/${pkg}`;
  }
};

const importToPackageMap: Record<string, string[]> = {
  chess: [getURL('chess-1.10.0-py3-none-any.whl')],
};

export const additionalPackagesFromCode = (code: string) => {
  const packages: string[] = [];
  let match;

  // Scan for imports and collect packages
  const importRegex =
    /^\s*import\s+(\w+)(?:\s+as\s+\w+)?(?:\s*,\s*(\w+)(?:\s+as\s+\w+)?)*|^\s*from\s+(\w+)(?:\.\w+)*\s+import/gm;
  const importedModules = new Set<string>();

  while ((match = importRegex.exec(code)) !== null) {
    // Handle 'import x' or 'import x, y, z'
    if (match[1]) {
      importedModules.add(match[1]);

      // Handle multiple imports on the same line (import x, y, z)
      if (match[2]) {
        const additionalImports = match[2].split(',').map(m => m.trim());
        for (const importName of additionalImports) {
          if (importName) importedModules.add(importName);
        }
      }
    }

    // Handle 'from x import ...'
    if (match[3]) {
      importedModules.add(match[3]);
    }
  }

  // Add required packages based on imports
  for (const importedModule of importedModules) {
    if (importToPackageMap[importedModule]) {
      const packageNames = importToPackageMap[importedModule];
      for (const packageName of packageNames) {
        if (!packages.includes(packageName)) {
          packages.push(packageName);
        }
      }
    }
  }
  return packages;
};
