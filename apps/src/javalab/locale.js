// locale for javalab

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';

let locale = safeLoadLocale('javalab_locale');
locale = localeWithI18nStringTracker(locale, 'javalab_locale');
module.exports = locale;
