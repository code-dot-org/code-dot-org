import Script from 'next/script';

import {Brand} from '@/config/brand';
import {getLocalizePath, getProjectId} from '@/providers/localize/config';

/**
 * Loads Localize in an SSR & CSR environment.
 */
const LocalizeLoader = ({brand}: {brand: Brand}) => (
  <>
    {/* Localize script for their widget from our CDN. */}
    <Script
      src={getLocalizePath()}
      strategy={'beforeInteractive'}
      id="localize-script"
      data-project-key={getProjectId(brand)}
      async
    />

    {/* Localize JS initializer */}
    <Script strategy={'beforeInteractive'}>
      {`
        const script = document.querySelector("script#localize-script");

        (function(a){if(!a.Localize){a.Localize={};for(var e=["translate","untranslate","phrase","initialize","translatePage","setLanguage","getLanguage","getSourceLanguage","detectLanguage","getAvailableLanguages","setWidgetLanguages","hideLanguagesInWidget","untranslatePage","bootstrap","prefetch","on","off","hideWidget","showWidget"],t=0;t<e.length;t++)a.Localize[e[t]]=function(){};}})(window);
      
        if (script && script.hasAttribute("data-project-key")) {
          const projectId = script.getAttribute("data-project-key");
          if (projectId !== "") {
            Localize.initialize({
              key: projectId,
              rememberLanguage: true,
              // Block classes that match developer mode Next.js overlays
              blockedClasses: [
                'nextjs-toast',
                'error-overlay-dialog',
                'error-overlay-notch',
                'error-overlay-pagination',
                'nextjs-container-build-error-version-status',
              ],
              showWidget: true,
            });
          } else {
            console.warn("Localize project ID was not valid.");
          }
        }
        else {
          console.warn("Localize was not installed correctly.");
        }
      `}
    </Script>
  </>
);

export default LocalizeLoader;
