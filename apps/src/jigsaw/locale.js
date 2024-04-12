// locale for jigsaw

import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';
import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';

let locale = safeLoadLocale('jigsaw_locale');
locale = localeWithI18nStringTracker(locale, 'jigsaw');
module.exports = locale;
