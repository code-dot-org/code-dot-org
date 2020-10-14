// locale for eval

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';

let locale = safeLoadLocale('eval_locale');
locale = localeWithI18nStringTracker(locale, 'eval_locale');
module.exports = locale;
