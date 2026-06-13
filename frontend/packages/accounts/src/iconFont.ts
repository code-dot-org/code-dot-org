import {injectFontAwesome} from '@code-dot-org/fonts';

/**
 * Load the FontAwesome icon webfont for the standalone dev host. Studio's page
 * already injects it (apps/studio/entrypoints/application.tsx); without it the
 * DSCO controls on this page (dropdown chevrons, field icons) render as blank
 * boxes. Dev-host only — not part of the package's built output.
 */
export function loadIconFont(): void {
  injectFontAwesome();
}
