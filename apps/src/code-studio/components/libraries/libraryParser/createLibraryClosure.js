/*
  This function was pulled out of `libraryParser.js` for circular dependency purposes and points towards further refactoring
  and breaking apart of libraryParser as potentially being useful.
*/

/**
 * Creates a closure to contain the library
 * The format will look like this:
 * var libraryName = (function() {function myFunc{doSomething}; return {myFunc: myFunc}})();
 * The library functions can be called with dot notation:
 * libraryName.myFunc();
 *
 * @param {object} json The library and all metadata
 *   json {
 *     functions: Array<string>
 *     source: string
 *     name: string
 *   }
 * @returns {string} closure The library closure
 */
export function createLibraryClosure(json) {
  let exportedFunctions = [];
  exportedFunctions = json.functions.map(name => `${name}: ${name}`);
  let functionsInClosure = exportedFunctions.join(',');
  return `var ${json.name} = (function() {${json.source};\nreturn {${functionsInClosure}}})();`;
}
