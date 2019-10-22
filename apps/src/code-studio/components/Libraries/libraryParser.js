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
 * Creates a droplet config for all functions in a library.
 * The format will look like this:
 * config: [
 *   {
 *     func: libName.funcName
 *     category: Functions
 *     params = [param1, param2]
 *     paletteParams = [param1, param2]
 *   }
 *   {
 *     func: ...
 *
 * @param {array} functions The list of functions and metadata to include
 * @param {string} libraryName The name of the library
 * @returns {null,object} null if there is an error. Else, the droplet config.
 */
function createDropletConfig(functions, libraryName) {
  let fullConfig = [];
  for (let currentFunction of functions) {
    if (!currentFunction.functionName) {
      return;
    }

    let individualConfig = {
      func: `${libraryName}.${currentFunction.functionName}`,
      category: 'Functions'
    };

    if (currentFunction.parameters && currentFunction.parameters.length > 0) {
      individualConfig.params = currentFunction.parameters;
      individualConfig.paletteParams = currentFunction.parameters;
    }

    fullConfig.push(individualConfig);
  }

  return fullConfig;
}

/**
 * Creates a closure to contain the library
 * The format will look like this:
 * var libraryName = (function() {function myFunc{doSomething}; return {myFunc: myFunc}})();
 * The library functions can be called with dot notation:
 * libraryName.myFunc();
 *
 * @param {string} code All the code in the library
 * @param {array} functions All functions that will be exported from the library
 * @param {string} libraryName The name of the library
 * @returns {null,string} null if there is an error. Else, the library closure
 */
function createLibraryClosure(code, functions, libraryName) {
  let exportedFunctions = [];
  for (let currentFunction of functions) {
    if (!currentFunction.functionName) {
      return;
    }
    exportedFunctions.push(
      `${currentFunction.functionName}: ${currentFunction.functionName}`
    );
  }

  let functionsInClosure = exportedFunctions.join(',');
  return `var ${libraryName} = (function() {${code}; return {${functionsInClosure}}})();`;
}

/**
 * Takes the input library elements and creates a json string from them to be
 * uploaded to S3
 * @param {string} code The code that makes up the library
 * @param {array} selectedFunctions The list of functions that will be exported from the library
 * @param {string} libraryName The name of the library to be exported
 * @param {string} libraryDescription The description of the library to be exported
 * @returns {null,string} null if there is an error. Else, a JSON string representing the library
 */
export function createLibraryJson(
  code,
  selectedFunctions,
  libraryName,
  libraryDescription
) {
  if (
    typeof code !== 'string' ||
    !Array.isArray(selectedFunctions) ||
    typeof libraryName !== 'string' ||
    !libraryName ||
    typeof libraryDescription !== 'string'
  ) {
    return;
  }

  let config = createDropletConfig(selectedFunctions, libraryName);
  let closure = createLibraryClosure(code, selectedFunctions, libraryName);
  if (!config || !closure) {
    return;
  }

  return JSON.stringify({
    name: libraryName,
    description: libraryDescription,
    dropletConfig: config,
    source: closure
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
