export default class MusicLibrary {
  groups: FolderGroup[];
  private allowedSounds: Sounds | null;

  constructor(libraryJson: any) {
    if (!libraryJson.groups || libraryJson.groups.length === 0) {
      throw new Error(`Invalid library JSON: ${libraryJson}`);
    }

    this.groups = libraryJson.groups;
    this.allowedSounds = null;
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

  // A progression step might specify a smaller set of allowed sounds.
  setAllowedSounds(allowedSounds: Sounds): void {
    this.allowedSounds = allowedSounds;
  }

  // A sound picker might want to show the subset of sounds permitted by the
  // progression's currently allowed sounds.
  getAllowedSounds(folderType: string): SoundFolder[] {
    const folders = this.groups[0].folders;

    // Let's just do a deep copy and then do filtering in-place.
    let foldersCopy: SoundFolder[] = JSON.parse(
      JSON.stringify(folders)
    ) as SoundFolder[];

    // Whether or not we have allowedSounds, we need to filter by type.
    foldersCopy = foldersCopy.filter(
      (folder: SoundFolder) => folder.type === folderType
    );

    if (this.allowedSounds) {
      foldersCopy = foldersCopy.filter(
        (folder: SoundFolder) => this.allowedSounds?.[folder.path]
      );

      foldersCopy.forEach((folder: SoundFolder) => {
        folder.sounds = folder.sounds.filter((sound: SoundData) =>
          this.allowedSounds?.[folder.path]?.includes(sound.src)
        );
      });
    }

    return foldersCopy;
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

interface Sounds {
  [index: string]: [string];
}
