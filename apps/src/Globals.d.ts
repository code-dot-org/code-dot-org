// Global TypeScript definitions

// Type definition for SCSS modules imported in TypeScript files
declare module '*.module.scss' {
  const classes: {[key: string]: string};
  export default classes;
}
