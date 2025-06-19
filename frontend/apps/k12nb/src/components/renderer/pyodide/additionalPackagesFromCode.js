"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.additionalPackagesFromCode = void 0;
var getURL = function (pkg) {
    if (process.env.NODE_ENV === 'development') {
        // Local dev server
        return "".concat(process.env.NEXT_PUBLIC_BASE_URL, "/pyodide/").concat(pkg);
    }
    else {
        // Production
        return "".concat(process.env.NEXT_PUBLIC_BASE_URL, "/pyodide/").concat(pkg);
    }
};
var importToPackageMap = {
    chess: [getURL('chess-1.10.0-py3-none-any.whl')],
};
var additionalPackagesFromCode = function (code) {
    var packages = [];
    var match;
    // Scan for imports and collect packages
    var importRegex = /^\s*import\s+(\w+)(?:\s+as\s+\w+)?(?:\s*,\s*(\w+)(?:\s+as\s+\w+)?)*|^\s*from\s+(\w+)(?:\.\w+)*\s+import/gm;
    var importedModules = new Set();
    while ((match = importRegex.exec(code)) !== null) {
        // Handle 'import x' or 'import x, y, z'
        if (match[1]) {
            importedModules.add(match[1]);
            // Handle multiple imports on the same line (import x, y, z)
            if (match[2]) {
                var additionalImports = match[2].split(',').map(function (m) { return m.trim(); });
                for (var _i = 0, additionalImports_1 = additionalImports; _i < additionalImports_1.length; _i++) {
                    var importName = additionalImports_1[_i];
                    if (importName)
                        importedModules.add(importName);
                }
            }
        }
        // Handle 'from x import ...'
        if (match[3]) {
            importedModules.add(match[3]);
        }
    }
    // Add required packages based on imports
    for (var _a = 0, importedModules_1 = importedModules; _a < importedModules_1.length; _a++) {
        var importedModule = importedModules_1[_a];
        if (importToPackageMap[importedModule]) {
            var packageNames = importToPackageMap[importedModule];
            for (var _b = 0, packageNames_1 = packageNames; _b < packageNames_1.length; _b++) {
                var packageName = packageNames_1[_b];
                if (!packages.includes(packageName)) {
                    packages.push(packageName);
                }
            }
        }
    }
    return packages;
};
exports.additionalPackagesFromCode = additionalPackagesFromCode;
