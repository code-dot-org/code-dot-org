// Global TypeScript definitions

// Type definition for SCSS modules imported in TypeScript files
declare module '*.module.scss' {
  const classes: {[key: string]: string};
  export default classes;
}

// Declaring dashboard as 'any' because it is not well documented.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const dashboard: any;
declare const IN_UNIT_TEST: boolean;
declare const IN_STORYBOOK: boolean;
declare const PISKEL_DEVELOPMENT_MODE: string;
declare const DEBUG_MINIFIED: number;

// Declare the type for the global Blockly object, set by the Blockly wrapper.
// The intersection type is needed as the Blockly wrapper provides additional
// functions and properties not present in Google Blockly. If/when these are
// converted to TypeScript, this type can be narrowed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Blockly: typeof import('blockly') & Record<string, any>;
