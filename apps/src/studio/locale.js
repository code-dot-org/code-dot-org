// locale for studio

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';

let locale = safeLoadLocale('studio_locale');
locale = localeWithI18nStringTracker(locale, 'studio_locale');
module.exports = locale;
