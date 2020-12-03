// locale for Spritelab

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';

let locale = safeLoadLocale('spritelab_locale');
locale = localeWithI18nStringTracker(locale, 'spritelab_locale');
module.exports = locale;
