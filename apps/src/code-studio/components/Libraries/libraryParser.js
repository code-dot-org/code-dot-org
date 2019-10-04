import {getFunctionsAndMetadata} from '@cdo/apps/lib/tools/jsinterpreter/JSInterpreter';

/**
 * Finds all functions in the provided code and returns them with any metadata
 * @param {string} code The code to parse to get all functions
 * @returns {array} A list of objects where each object represents a function with its doc comment and params
 */
export function getFunctions(code) {
  return getFunctionsAndMetadata(code);
}

/**
 * Takes the input library elements and creates a json string from them to be
 * uploaded to S3
 * @param {string} code The code that makes up the library
 * @param {array} selectedFunctions The list of functions that will be exported from the library
 * @param {string} libraryName The name of the library to be exported
 * @returns {string} A JSON string representign the library
 */
export function createLibraryJson(code, selectedFunctions, libraryName) {
  if (
    typeof code !== 'string' ||
    !Array.isArray(selectedFunctions) ||
    typeof libraryName !== 'string' ||
    !libraryName
  ) {
    return;
  }

  let exportedFunctions = [];
  let fullConfig = [];
  for (let selectedFunction of selectedFunctions) {
    if (!selectedFunction || !selectedFunction.functionName) {
      return;
    }
    exportedFunctions.push(
      `${selectedFunction.functionName}: ${selectedFunction.functionName}`
    );
    let individualConfig = {
      func: `${libraryName}.${selectedFunction.functionName}`,
      category: 'Functions'
    };

    if (selectedFunction.parameters && selectedFunction.parameters.length > 0) {
      individualConfig.params = selectedFunction.parameters;
      individualConfig.paletteParams = selectedFunction.parameters;
    }

    fullConfig.push(individualConfig);
  }

  let functionsInClosure = exportedFunctions.join(',');
  let libraryClosure = `var ${libraryName} = (function() {${code}; return {${functionsInClosure}}})();`;

  return JSON.stringify({
    name: libraryName,
    dropletConfig: fullConfig,
    source: libraryClosure
  });
}

/**
 * Removes all illegal characters from a library's name and insures it starts
 * with a capitalized letter.
 * @param {string} libraryName The name of the library
 * @returns {string} The name of the library without any illegal characters.
 */
export function sanitizeName(libraryName) {
  // /\s+/g <- removes all whtespace
  // /\W/g <- removes all characters except numbers and letters and underscores
  let sanitizedName = libraryName.replace(/\s+/g, '').replace(/\W/g, '');
  if (sanitizedName.length === 0 || !isNaN(sanitizedName.charAt(0))) {
    sanitizedName = 'Lib' + sanitizedName;
  }
  sanitizedName =
    sanitizedName.charAt(0).toUpperCase() + sanitizedName.slice(1);
  return sanitizedName;
}

export default {getFunctions, createLibraryJson, sanitizeName};
