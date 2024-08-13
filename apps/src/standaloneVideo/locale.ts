/**
 * A TypeScript wrapper for the StandaloneVideolocale object which casts
 * it to the {@link StandaloneVideoLocale} type.
 */
import {StandaloneVideoLocale} from './types';

const standaloneVideoLocale = require('@cdo/standaloneVideo/locale');

export default standaloneVideoLocale as StandaloneVideoLocale;
