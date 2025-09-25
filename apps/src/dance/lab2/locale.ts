/**
 * A TypeScript wrapper for the Dance locale object which casts
 * it to the {@link Locale} type.
 */
import {Locale} from '@cdo/apps/types/locale';

import * as danceMsg from '../locale';

const typedDanceMsg = danceMsg as Locale<
  typeof import('@cdo/i18n/dance/en_us.json')
>;

export default typedDanceMsg;
