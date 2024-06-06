// locale for turtle

import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';
import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';

let locale = safeLoadLocale('turtle_locale');
locale = localeWithI18nStringTracker(locale, 'turtle');
module.exports = locale;
