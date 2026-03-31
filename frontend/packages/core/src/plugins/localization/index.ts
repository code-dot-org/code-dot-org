import type {LanguageInfo} from './Localization';
import {localization, Localization} from './Localization';
import {useLocalization} from './useLocalization';
import type {CorePlugin} from '../../config';

export type {LanguageInfo};
export {localization, Localization, useLocalization};

/**
 * CorePlugin implementation for LocalizeJS-based localization.
 * Register at bootstrap via initializeCore({plugins: [localizationPlugin]}).
 *
 * Localization initializes lazily via window.LocalizeLoader — no synchronous
 * work is needed in onCoreReady.
 */
export const localizationPlugin: CorePlugin = {
  onCoreReady() {
    // Localization binds to window.LocalizeLoader asynchronously on construction.
    // No additional setup is needed here; the localization singleton is already
    // instantiated at module load time.
  },
};
