// Global TypeScript definitions

// Type definition for SCSS modules imported in TypeScript files
declare module '*.module.scss' {
  const classes: {[key: string]: string};
  export default classes;
}

// Declaring dashboard as any since it is not well documented.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const dashboard: any;
