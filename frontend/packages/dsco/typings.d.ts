// scss files are fed through the sass build pipeline and do not have types
// therefore, tell typescript to stub out scss modules
declare module "*.module.scss";