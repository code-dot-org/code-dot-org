import CodeStudioConfig from './SiteConfig';
import type {SiteConfig, SiteConfigExtensions} from './SiteConfig';

/**
 * Interface that plugins implement to hook into core initialization.
 */
export interface CorePlugin {
  /**
   * Called by initializeCore with the full SiteConfig after core is ready.
   * The config is cast to include any SiteConfigExtensions augmented by plugins.
   */
  onCoreReady(config: SiteConfig & SiteConfigExtensions): void;
}

export interface InitializeCoreOptions {
  /**
   * Plugins to initialize during core bootstrap.
   */
  plugins?: CorePlugin[];
}

/**
 * Initialize Code Studio core: registers SiteConfig on window and calls
 * onCoreReady on each supplied plugin.
 *
 * @param options - Core initialization options.
 *
 * @example
 *   initializeCore({plugins: [localizationPlugin]});
 */
export function initializeCore({
  plugins = [],
}: InitializeCoreOptions = {}): void {
  if (!window.__CODE_STUDIO__) {
    window.__CODE_STUDIO__ = CodeStudioConfig;
  }
  for (const plugin of plugins) {
    plugin.onCoreReady(CodeStudioConfig as SiteConfig & SiteConfigExtensions);
  }
}
