// Global TypeScript definitions
// These are types that do not rely on any external imports. If you
// need to import to declare a type, add to GlobalsModule.d.ts instead.

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

// Declaring stylelint as any for now. We are using this to lint CSS in Web Lab 2,
// which is currently experimental.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const stylelint: any;

// Imported static files are treated as strings
declare module '*.png' {
  const value: string;
  export = value;
}

declare module '*.svg' {
  const value: string;
  export = value;
}

// Modules without types
declare module '@blockly/plugin-scroll-options';
declare module '@blockly/keyboard-navigation';
declare module '@blockly/field-angle';
declare module '@blockly/field-bitmap';
declare module '@cdo/locale';
