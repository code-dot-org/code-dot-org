export default class MusicLibrary {
  groups: FolderGroup[];

  constructor(libraryJson: any) {
    if (!libraryJson.groups || libraryJson.groups.length === 0) {
      console.warn('Invalid library JSON');
      this.groups = [];
    } else {
      this.groups = libraryJson.groups;
    }
  }

  getSoundForId(id: string): SoundData | null {
    const splitId = id.split('/');
    const path = splitId[0];
    const src = splitId[1];

    const folder = this.groups[0].folders.find(
      folder => folder.path === path
    );

    if (folder) {
      return folder.sounds.find(sound => sound.src === src) || null;
    }

    return null;
  }
}

export type SoundType = 'beat' | 'bass' | 'lead' | 'fx';

export interface SoundData {
  name: string;
  src: string;
  length: number;
  type: SoundType;
}

interface SoundFolder {
  name: string;
  type?: 'kit';
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
