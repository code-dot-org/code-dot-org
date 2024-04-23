/**
 * DO NOT IMPORT THIS DIRECTLY. Instead do:
 *   ```
 *   import msg from '@cdo/locale'.
 *   ```
 * This allows the webpack config to determine how locales should be loaded,
 * which is important for making locale setup work seemlessly in tests.
 */
// base locale

import cookies from 'js-cookie';
import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';

export default localeWithI18nStringTracker(
  safeLoadLocale('common_locale'),
  'common'
);

export const currentLocale = cookies.get('language_') || 'en-US';
