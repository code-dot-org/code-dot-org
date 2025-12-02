/**
 * A TypeScript wrapper for the sketchlabLocale object which casts
 * it to the {@link Locale} type.
 */
import {Locale} from '@cdo/apps/types/locale';

import * as sketchlabMsg from './localeUntyped';

const typedSketchlabMsg = sketchlabMsg as Locale<
  typeof import('@cdo/i18n/sketchlab/en_us.json')
>;

export default typedSketchlabMsg;
