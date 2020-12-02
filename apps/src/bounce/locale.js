// locale for bounce

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';

let locale = safeLoadLocale('bounce_locale');
locale = localeWithI18nStringTracker(locale, 'bounce_locale');
module.exports = locale;
