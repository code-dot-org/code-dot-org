/**
 * A TypeScript wrapper for the CodebridgeLocale object which casts
 * it to the {@link Locale} type.
 */
import {Locale} from '@cdo/apps/types/locale';

export default require('@cdo/codebridge/locale') as Locale<
  typeof import('@cdo/i18n/codebridge/en_us.json')
>;
