// locale for ailab

import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';
import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';

let locale = safeLoadLocale('ailab_locale');
locale = localeWithI18nStringTracker(locale, 'ailab');
module.exports = locale;
