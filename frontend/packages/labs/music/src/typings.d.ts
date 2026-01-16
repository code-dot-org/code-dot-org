// scss files are fed through the sass build pipeline and do not have types
// therefore, tell typescript to stub out scss modules
declare module '*.module.scss';
declare module '*.scss';
declare module '*.png';
declare module '*.svg';

// Vite worker imports with inline query
declare module '*?worker&inline' {
  const workerConstructor: new () => Worker;
  export default workerConstructor;
}
