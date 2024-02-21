// Global Type Definitions that rely on imports.
// If you use an import, the type definition file becomes a module file
// and the syntax for declaring types changes. Therefore all types that require
// imports should be added to this file, otherwise they can be added to Globals.d.ts.
// Information on modules: https://www.typescriptlang.org/docs/handbook/2/modules.html#how-javascript-modules-are-defined

import {BlocklyWrapperType} from './blockly/types';

// Declare the type for the global Blockly object, set by the Blockly wrapper.
declare global {
  const Blockly: BlocklyWrapperType;
}
