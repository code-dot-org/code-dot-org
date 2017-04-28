/** @file Some common selectors for redux state questions */

/**
 * Whether run mode indicators (different colored panel title bars, etc)
 * should be used in the current app.
 */
export function shouldUseRunModeIndicators(state) {
  // Everywhere but Minecraft
  return !state.pageConstants.isMinecraft;
}
