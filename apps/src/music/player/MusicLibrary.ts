import {ResponseValidator} from '@cdo/apps/util/HttpClient';

export default class MusicLibrary {
  groups: FolderGroup[];
  private allowedSounds: Sounds | null;

  constructor(libraryJson: LibraryJson) {
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

export type LibraryJson = {
  groups: FolderGroup[];
};

export const LibraryValidator: ResponseValidator<LibraryJson> = response => {
  const libraryJson = response as LibraryJson;
  if (!libraryJson.groups || libraryJson.groups.length === 0) {
    throw new Error(`Invalid library JSON: ${response}`);
  }
  return libraryJson;
};

export type SoundType = 'beat' | 'bass' | 'lead' | 'fx';

/**
 * A single event in a {@link SampleSequence}
 */
export interface SequenceEvent {
  /** 1-indexed start position of this event, in 16th notes */
  position: number;
  /**
   * The note value of this event, expressed as a numerical semitone
   * offset from the project root note.
   */
  noteOffset: number;
  /** Length of this event, in 16th notes */
  length: number;
}

/**
 * A sequence of individual samples, used to programmaticaly
 * generate sounds at the current key and BPM.
 */
export interface SampleSequence {
  instrument: string;
  events: SequenceEvent[];
}

export interface SoundData {
  name: string;
  src: string;
  length: number;
  type: SoundType;
  note?: number;
  restricted?: boolean;
  sequence?: SampleSequence;
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
