// locale for calc

import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';
import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';

let locale = safeLoadLocale('calc_locale');
locale = localeWithI18nStringTracker(locale, 'calc');
module.exports = locale;
