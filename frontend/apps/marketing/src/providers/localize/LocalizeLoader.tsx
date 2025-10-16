'use client';
import Script from 'next/script';

import {Brand} from '@/config/brand';
import {getLocalizeJsLocaleFromSupportedLocale} from '@/config/locale';
import {getLocalizePath, getProjectId} from '@/config/localize';

/**
 * Loads Localize in an SSR & CSR environment.
 */
const LocalizeLoader = ({
  brand,
  locale,
  isDraftMode,
}: {
  brand: Brand;
  locale: string;
  isDraftMode: boolean;
}) => (
  <>
    {/* Localize script for their widget from our CDN. */}
    <Script
      src={getLocalizePath()}
      id="localize-script"
      data-project-key={getProjectId(brand)}
      onLoad={() => {
        const script = document.querySelector('script#localize-script');

        (function (a) {
          if (!a.Localize) {
            (a.Localize as {[key: string]: () => void}) = {};
            for (
              let e = [
                  'translate',
                  'untranslate',
                  'phrase',
                  'initialize',
                  'translatePage',
                  'setLanguage',
                  'getLanguage',
                  'getSourceLanguage',
                  'detectLanguage',
                  'getAvailableLanguages',
                  'setWidgetLanguages',
                  'hideLanguagesInWidget',
                  'untranslatePage',
                  'bootstrap',
                  'prefetch',
                  'on',
                  'off',
                  'hideWidget',
                  'showWidget',
                ],
                t = 0;
              t < e.length;
              t++
            )
              (a.Localize as {[key: string]: () => void})[e[t]] =
                function () {};
          }
        })(window);

        if (script && script.hasAttribute('data-project-key')) {
          const projectId = script.getAttribute('data-project-key');
          if (projectId !== '') {
            Localize.initialize({
              key: projectId!,
              autodetectLanguage: true,
              rememberLanguage: false, // use the locale in the URL instead
              defaultLanguage: getLocalizeJsLocaleFromSupportedLocale(locale),
              disableWidget: true, // use our own language dropdown
              // Block classes that match developer mode Next.js overlays
              blockedClasses: [
                'nextjs-toast',
                'error-overlay-dialog',
                'error-overlay-notch',
                'error-overlay-pagination',
                'nextjs-container-build-error-version-status',
              ],
              saveNewPhrases: isDraftMode,
            } as LocalizeJS.Context.Options);
          } else {
            console.warn('Localize project ID was not valid.');
          }
        } else {
          console.warn('Localize was not installed correctly.');
        }
      }}
    ></Script>
  </>
);

export default LocalizeLoader;
