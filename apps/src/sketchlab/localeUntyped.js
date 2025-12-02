import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';
import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';

let locale = safeLoadLocale('sketchlab_locale');
locale = localeWithI18nStringTracker(locale, 'sketchlab');
module.exports = locale;
