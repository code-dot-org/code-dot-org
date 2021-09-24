// locale for Poetry

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';

let locale = safeLoadLocale('poetry_locale');
locale = localeWithI18nStringTracker(locale, 'poetry_locale');
module.exports = locale;
