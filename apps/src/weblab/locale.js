// locale for weblab

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';

let locale = safeLoadLocale('weblab_locale');
locale = localeWithI18nStringTracker(locale, 'weblab_locale');
module.exports = locale;
