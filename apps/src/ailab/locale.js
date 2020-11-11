// locale for ailab

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';

let locale = safeLoadLocale('ailab_locale');
locale = localeWithI18nStringTracker(locale, 'ailab_locale');
module.exports = locale;
