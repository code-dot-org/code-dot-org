// locale for fish

import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';
import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';

let locale = safeLoadLocale('fish_locale');
locale = localeWithI18nStringTracker(locale, 'fish');
module.exports = locale;
