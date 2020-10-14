// locale for flappy

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';

let locale = safeLoadLocale('flappy_locale');
locale = localeWithI18nStringTracker(locale, 'flappy_locale');
module.exports = locale;
