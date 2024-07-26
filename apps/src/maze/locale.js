// locale for maze
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';
import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';

let locale = safeLoadLocale('maze_locale');
locale = localeWithI18nStringTracker(locale, 'maze');
module.exports = locale;
