import CodeStudioConfig from './SiteConfig';
import type {SiteConfig, SiteConfigExtensions} from './SiteConfig';

/**
 * Interface that plugins implement to hook into core initialization.
 * Requirements: 6.1, 7.3
 */
export interface CorePlugin {
  /**
   * Called by initializeCore with the full SiteConfig after core is ready.
   * The config is cast to include any SiteConfigExtensions augmented by plugins.
   */
  onCoreReady(config: SiteConfig & SiteConfigExtensions): void;
}

/**
 * Initialize Code Studio core: registers SiteConfig on window and calls
 * onCoreReady on each supplied plugin.
 * Requirements: 6.1, 7.3
 */
export function initializeCore(plugins: CorePlugin[] = []): void {
  if (!window.__CODE_STUDIO__) {
    window.__CODE_STUDIO__ = CodeStudioConfig;
  }
  for (const plugin of plugins) {
    plugin.onCoreReady(CodeStudioConfig as SiteConfig & SiteConfigExtensions);
  }
}
