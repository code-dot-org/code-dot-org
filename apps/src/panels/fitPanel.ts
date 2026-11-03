// The space a panel takes in its host: margins to the host's edges, a row
// under the panel for its controls, and the panel's aspect ratio. Shared
// with other step views that want to sit where a panel would.

export const PANEL_HORIZONTAL_MARGIN = 40;
export const PANEL_VERTICAL_MARGIN = 50;
export const PANEL_CONTROLS_HEIGHT = 70;
export const PANEL_ASPECT_RATIO = 16 / 9;

/**
 * The largest panel that fits a host of the given size, beside its margins
 * and the controls row under it.
 */
export function fitPanel(
  hostWidth: number,
  hostHeight: number
): {width: number; height: number} {
  const maxWidth = hostWidth - PANEL_HORIZONTAL_MARGIN * 2;
  const maxHeight =
    hostHeight - PANEL_VERTICAL_MARGIN * 2 - PANEL_CONTROLS_HEIGHT;
  if (maxWidth / maxHeight > PANEL_ASPECT_RATIO) {
    return {width: maxHeight * PANEL_ASPECT_RATIO, height: maxHeight};
  }
  return {width: maxWidth, height: maxWidth / PANEL_ASPECT_RATIO};
}
