import type {LanguageInfo} from './Localization';
import {localization, Localization} from './Localization';
import type {LoadLocalizeOptions} from './loadLocalize';
import {DefaultLocalizeOptions, loadLocalize} from './loadLocalize';
import type {LocaleSource, LocalesState} from './useLocales';
import {useLocales} from './useLocales';
import {useLocalization} from './useLocalization';
import type {CorePlugin} from '../../config';

export type {LanguageInfo, LoadLocalizeOptions, LocaleSource, LocalesState};
export {
  DefaultLocalizeOptions,
  loadLocalize,
  localization,
  Localization,
  useLocales,
  useLocalization,
};

/**
 * Returns a localization plugin that loads LocalizeJS for the given project
 * when no host page has loaded it already. Without a key, it only binds to
 * a loader the host page provides.
 *
 * @param options - The project key and any LocalizeJS option overrides.
 */
export function createLocalizationPlugin(
  options?: LoadLocalizeOptions,
): CorePlugin {
  return {
    onCoreReady() {
      const source =
        window.LocalizeLoader ??
        (options?.key ? loadLocalize(options) : undefined);
      if (source) {
        localization.attach(source);
      }
    },
  };
}

/**
 * Binds the localization singleton to the host page's LocalizeJS loader.
 * Register at bootstrap via initializeCore({plugins: [localizationPlugin]}).
 */
export const localizationPlugin: CorePlugin = createLocalizationPlugin();
