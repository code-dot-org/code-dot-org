// locale for fish

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';

let locale = safeLoadLocale('fish_locale');
locale = localeWithI18nStringTracker(locale, 'fish_locale');
module.exports = locale;
