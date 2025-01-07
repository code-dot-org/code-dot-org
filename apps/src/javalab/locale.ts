/**
 * A TypeScript wrapper for the Java Lab locale object which casts
 * it to the {@link Locale} type.
 */
import {Locale} from '@cdo/apps/types/locale';

export default require('@cdo/javalab/locale') as Locale<
  typeof import('@cdo/i18n/javalab/en_us.json')
>;
