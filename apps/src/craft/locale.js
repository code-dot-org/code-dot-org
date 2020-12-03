import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';

let locale = safeLoadLocale('craft_locale');
locale = localeWithI18nStringTracker(locale, 'craft_locale');
module.exports = locale;
