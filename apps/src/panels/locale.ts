/**
 * A TypeScript wrapper for the StandaloneVideolocale object which casts
 * it to the {@link PanelsLocale} type.
 */
import {PanelsLocale} from './types';
const panelsLocale = require('@cdo/panels/locale');

export default panelsLocale as PanelsLocale;
