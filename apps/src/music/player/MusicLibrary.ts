export default class MusicLibrary {
  groups: FolderGroup[];

  constructor(libraryJson: any) {
    if (!libraryJson.groups || libraryJson.groups.length === 0) {
      throw new Error(`Invalid library JSON: ${libraryJson}`);
    }

    this.groups = libraryJson.groups;
  }

  getLengthForId(id: string): number | null {
    return this.getSoundForId(id)?.length || null;
  }

  getSoundForId(id: string): SoundData | null {
    const splitId = id.split('/');
    const path = splitId[0];
    const src = splitId[1];

    const folder = this.getFolderForPath(path);

    if (folder) {
      return folder.sounds.find(sound => sound.src === src) || null;
    }

    return null;
  }

  getFolderForPath(path: string): SoundFolder | null {
    return this.groups[0].folders.find(folder => folder.path === path) || null;
  }
}

export type SoundType = 'beat' | 'bass' | 'lead' | 'fx';

export interface SoundData {
  name: string;
  src: string;
  length: number;
  type: SoundType;
  note?: number;
}

export interface SoundFolder {
  name: string;
  type?: 'kit' | 'instrument';
  path: string;
  imageSrc: string;
  sounds: SoundData[];
}

interface FolderGroup {
  id: string;
  name: string;
  imageSrc: string;
  path: string;
  folders: SoundFolder[];
}
