export default interface MusicLibrary {
  groups: FolderGroup[];
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
