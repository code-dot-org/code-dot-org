// locale for maze
import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';

let locale = safeLoadLocale('maze_locale');
locale = localeWithI18nStringTracker(locale, 'maze_locale');
module.exports = locale;
