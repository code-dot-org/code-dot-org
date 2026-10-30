/**
 * A TypeScript wrapper for the weblab2Locale object which casts
 * it to the {@link Locale} type.
 */
import {Locale} from '@cdo/apps/types/locale';

export default require('@cdo/weblab2/locale') as Locale<
  typeof import('@cdo/i18n/weblab2/en_us.json')
>;
