/**
 * A TypeScript wrapper for the Music Lab locale object which casts
 * it to the {@link MusicLocale} type.
 */
import {MusicLocale} from './types';
import musicI18n from '@cdo/music/locale';

export default musicI18n as MusicLocale;
