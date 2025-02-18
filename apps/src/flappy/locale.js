// locale for flappy

import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';
import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';

let locale = safeLoadLocale('flappy_locale');
locale = localeWithI18nStringTracker(locale, 'flappy');
module.exports = locale;
