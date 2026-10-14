// vite.native.config.ts builds with --mode native; every web build uses Vite's
// default modes. Read at call time so tests can stub the mode.
export const isNativeBuild = () => import.meta.env.MODE === 'native';
