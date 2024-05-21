// locale for signup

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';

let locale = safeLoadLocale('signup_locale');
locale = localeWithI18nStringTracker(locale, 'signup');
module.exports = locale;
