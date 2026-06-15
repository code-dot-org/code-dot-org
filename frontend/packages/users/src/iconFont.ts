import {injectFontAwesome} from '@code-dot-org/fonts';

/**
 * Loads the FontAwesome icon webfont for the standalone dev host only; Studio
 * already injects it. Without it, DSCO controls render as blank boxes.
 */
export function loadIconFont(): void {
  injectFontAwesome();
}
