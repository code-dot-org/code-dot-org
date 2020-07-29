// locale for maze
import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nLogger from '@cdo/apps/util/i18nLogger';

let locale = safeLoadLocale('maze_locale');
locale = localeWithI18nLogger(locale, 'maze_locale');
module.exports = locale;
