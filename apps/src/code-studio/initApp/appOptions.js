/** @type {AppOptionsConfig} */
let APP_OPTIONS;

/** @param {AppOptionsConfig} appOptions */
export function setAppOptions(appOptions) {
  APP_OPTIONS = appOptions;
  // ugh, a lot of code expects this to be on the window object pretty early on.
  /** @type {AppOptionsConfig} */
  window.appOptions = appOptions;
}

/** @return {AppOptionsConfig} */
export function getAppOptions() {
  if (!APP_OPTIONS) {
    throw new Error(
      "App Options have not been loaded yet! Did you forget to call loadAppOptions()?"
    );
  }
  return APP_OPTIONS;
}
