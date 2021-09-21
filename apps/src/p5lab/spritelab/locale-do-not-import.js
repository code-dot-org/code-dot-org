// locale for Spritelab

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';

export const locale = localeWithI18nStringTracker(
  safeLoadLocale('spritelab_locale'),
  'spritelab_locale'
);
