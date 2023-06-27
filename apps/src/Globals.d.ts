// Global TypeScript definitions

// Type definition for SCSS modules imported in TypeScript files
declare module '*.module.scss' {
  const classes: {[key: string]: string};
  export default classes;
}

declare const IN_UNIT_TEST: boolean;
declare const IN_STORYBOOK: boolean;
declare const PISKEL_DEVELOPMENT_MODE: string;
declare const DEBUG_MINIFIED: number;
