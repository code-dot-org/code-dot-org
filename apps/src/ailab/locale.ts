// locale for ailab

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';

import {Locale} from '../types/locale';

const locale = safeLoadLocale('ailab_locale') as Locale<
  typeof import('@cdo/i18n/ailab/en_us.json')
>;
export default locale;
