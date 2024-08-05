// locale for signup

import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';
import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';

let locale = safeLoadLocale('signup_locale');
locale = localeWithI18nStringTracker(locale, 'signup');
module.exports = locale;
