/**
 * A TypeScript wrapper for the Music Lab locale object which casts
 * it to the {@link Locale} type.
 */
import {Locale} from '@cdo/apps/types/locale';

export default require('@cdo/music/locale') as Locale<
  typeof import('@cdo/i18n/music/en_us.json')
>;
