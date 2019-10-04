import {getFunctionsAndMetadata} from '@cdo/apps/lib/tools/jsinterpreter/JSInterpreter';

export function getFunctions(code) {
  return getFunctionsAndMetadata(code);
}

export function createLibraryJson(code, selectedFunctions, libraryName) {
  let exportedFunctions = [];
  let fullConfig = [];
  selectedFunctions.forEach(selectedFunction => {
    exportedFunctions.push(
      `${selectedFunction.functionName}: ${selectedFunction.functionName}`
    );
    let individualConfig = {
      func: `${libraryName}.${selectedFunction.functionName}`,
      category: 'Functions'
    };

    if (selectedFunction.parameters.length > 0) {
      individualConfig.params = selectedFunction.parameters;
      individualConfig.paletteParams = selectedFunction.parameters;
    }

    fullConfig.push(individualConfig);
  });

  let functionsInClosure = exportedFunctions.join(',');
  let libraryClosure = `var ${libraryName} = (function() {${code}; return {${functionsInClosure}}})();`;

  return JSON.stringify({
    name: libraryName,
    dropletConfig: fullConfig,
    source: libraryClosure
  });
}

export function sanitizeName(libraryName) {
  let sanitizedName = libraryName.replace(/\s+/g, '').replace(/\W/g, '');
  if (sanitizedName.length === 0 || !isNaN(sanitizedName.charAt(0))) {
    sanitizedName = 'Lib' + sanitizedName;
  }
  sanitizedName =
    sanitizedName.charAt(0).toUpperCase() + sanitizedName.slice(1);
  return sanitizedName;
}

export default {getFunctions, createLibraryJson, sanitizeName};
