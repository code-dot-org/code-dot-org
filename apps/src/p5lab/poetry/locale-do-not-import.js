// locale for Poetry

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';

export default localeWithI18nStringTracker(
  safeLoadLocale('poetry_locale'),
  'poetry_locale'
);
