/**
 * A TypeScript wrapper for the Music Lab locale object which casts
 * it to the {@link MusicLocale} type.
 */
import {MusicLocale} from './types';
const musicLocale = require('@cdo/music/locale');

export default musicLocale as MusicLocale;
