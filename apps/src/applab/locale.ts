// locale for applab

import safeLoadLocale from '@cdo/apps/util/safeLoadLocale';

import {Locale} from '../types/locale';

const locale = safeLoadLocale('applab_locale') as Locale<
  typeof import('@cdo/i18n/applab/en_us.json')
>;
export default locale;
