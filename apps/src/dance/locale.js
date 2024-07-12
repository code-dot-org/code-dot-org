import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';
import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';

let locale = safeLoadLocale('dance_locale');
locale = localeWithI18nStringTracker(locale, 'dance');
module.exports = locale;
