/**
 * A TypeScript wrapper for the StandaloneVideoLocale object which casts
 * it to the {@link Locale} type.
 */
import {Locale} from '@cdo/apps/types/locale';

export default require('@cdo/standaloneVideo/locale') as Locale<
  typeof import('@cdo/i18n/standaloneVideo/en_us.json')
>;
