// locale for bounce

import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';
import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';

let locale = safeLoadLocale('bounce_locale');
locale = localeWithI18nStringTracker(locale, 'bounce');
module.exports = locale;
