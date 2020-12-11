// locale for jigsaw

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';

let locale = safeLoadLocale('jigsaw_locale');
locale = localeWithI18nStringTracker(locale, 'jigsaw_locale');
module.exports = locale;
