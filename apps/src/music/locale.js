// locale for music

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';

let locale = safeLoadLocale('music_locale');
locale = localeWithI18nStringTracker(locale, 'music');
module.exports = locale;
