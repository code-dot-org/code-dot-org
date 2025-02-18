// locale for Poetry

import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';
import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';

export default localeWithI18nStringTracker(
  safeLoadLocale('poetry_locale'),
  'poetry_locale'
);
