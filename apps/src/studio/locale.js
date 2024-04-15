// locale for studio

import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';
import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';

let locale = safeLoadLocale('studio_locale');
locale = localeWithI18nStringTracker(locale, 'studio');
module.exports = locale;
