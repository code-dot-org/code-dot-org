// vite.mobile.config.ts sets mode "mobile"; every web build uses Vite's
// default modes. Read at call time so tests can stub the mode.
export const isMobileBuild = () => import.meta.env.MODE === 'mobile';
