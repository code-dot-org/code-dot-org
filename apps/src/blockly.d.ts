import {BlocklyWrapperType} from './blockly/types';

// Declare the type for the global Blockly object, set by the Blockly wrapper.
// This is in it own file because Globals.d.ts is not a module file, but by importing
// BlocklyWrapperType this file becomes a module file. This makes the syntax more complicated
// for other globals, so it is moved here.
declare global {
  const Blockly: BlocklyWrapperType;
}
