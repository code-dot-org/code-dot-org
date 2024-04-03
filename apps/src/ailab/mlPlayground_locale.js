// locale for ml-playground

import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';
import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';

let locale = safeLoadLocale('mlPlayground_locale');
locale = localeWithI18nStringTracker(locale, 'mlPlayground');
module.exports = locale;
