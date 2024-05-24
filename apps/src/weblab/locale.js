// locale for weblab

import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';
import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';

let locale = safeLoadLocale('weblab_locale');
locale = localeWithI18nStringTracker(locale, 'weblab');
module.exports = locale;
