// locale for ml-playground

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';

let locale = safeLoadLocale('mlPlayground_locale');
locale = localeWithI18nStringTracker(locale, 'mlPlayground');

export default locale;
