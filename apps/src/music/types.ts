// TODO: Ideally this type would only contain keys present in
// translated string JSON files (ex. apps/i18n/music/en_us.json).
// However, this requires depending on files outside of apps/src,
// so this approach is still being investigated. For now, this type
// is an object whose keys are all functions which return strings,

import {ProjectLevelData} from '../lab2/types';

// matching what we expect for a locale object.
export type MusicLocale = {
  [key: string]: (replaceMap?: {[key: string]: string}) => string;
};

// TODO: Use this interface when converting MusicView to TypeScript
export interface MusicLevelData extends ProjectLevelData {
  toolbox?: {
    [key: string]: string[];
  };
  sounds?: {
    [key: string]: string[];
  };
  library?: string;
}
