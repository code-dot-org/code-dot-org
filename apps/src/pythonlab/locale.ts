/**
 * A TypeScript wrapper for the PythonlabLocale object which casts
 * it to the {@link Locale} type.
 */
import {Locale} from '@cdo/apps/types/locale';

export default require('@cdo/pythonlab/locale') as Locale<
  typeof import('@cdo/i18n/pythonlab/en_us.json')
>;
