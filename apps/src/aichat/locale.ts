/**
 * A TypeScript wrapper for the AichatLocale object which casts
 * it to the {@link Locale} type.
 */
import {Locale} from '@cdo/apps/types/locale';

export default require('@cdo/aichat/locale') as Locale<
  typeof import('@cdo/i18n/aichat/en_us.json')
>;
