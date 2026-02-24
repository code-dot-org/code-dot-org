/**
 * A TypeScript wrapper for the Lab2 Locale object which casts
 * it to the {@link Locale} type.
 */
import {Locale} from '@cdo/apps/types/locale';

export default require('@cdo/lab2/locale') as Locale<
  typeof import('@cdo/i18n/lab2/en_us.json')
>;
