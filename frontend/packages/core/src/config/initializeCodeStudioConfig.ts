import CodeStudioConfig from './SiteConfig';

export function initializeCodeStudioConfig() {
  const siteConfig = CodeStudioConfig;

  if (!window.__CODE_STUDIO__) {
    window.__CODE_STUDIO__ = siteConfig;
  }
}
