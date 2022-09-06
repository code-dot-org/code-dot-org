// locale for ailab

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';
import localeWithI18nStringTracker from '@cdo/apps/util/i18nStringTracker';

export const locale = localeWithI18nStringTracker(safeLoadLocale('ailab_locale'), 'ailab')
