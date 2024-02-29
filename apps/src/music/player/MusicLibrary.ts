import {ResponseValidator} from '@cdo/apps/util/HttpClient';
import {Key} from '../utils/Notes';

export default class MusicLibrary {
  private static instance: MusicLibrary;

  static getInstance(): MusicLibrary | undefined {
    return this.instance;
  }

  static setCurrent(library: MusicLibrary) {
    this.instance = library;
  }

  name: string;
  libraryJson: LibraryJson;
  folders: SoundFolder[];
  private allowedSounds: Sounds | null;

  // BPM & Key associated with this library, or undefined if not present.
  private bpm: number | undefined;
  private key: Key | undefined;

  constructor(name: string, libraryJson: LibraryJson) {
    this.name = name;
    this.libraryJson = libraryJson;
    this.allowedSounds = null;

    // Combine the JSON-specified folders into one flat list of folders.
    this.folders = [
      ...libraryJson.packs,
      ...libraryJson.instruments,
      ...libraryJson.kits,
    ];

    if (libraryJson.bpm) {
      this.bpm = libraryJson.bpm;
    }

    if (libraryJson.key) {
      this.key = Key[libraryJson.key.toUpperCase() as keyof typeof Key];
    }
  }

  getDefaultSound(): string | undefined {
    // Return the specified default sound if there is one.
    if (this.libraryJson?.defaultSound) {
      return this.libraryJson?.defaultSound;
    }

    // The fallback is the first non-instrument/kit folder's first sound.
    const firstFolder = this.folders.find(group => !group.type);
    return `${firstFolder?.id}/${firstFolder?.sounds[0].src}`;
  }

  getSoundForId(id: string): SoundData | null {
    var lastSlashIndex = id.lastIndexOf('/');
    var folderId = id.substring(0, lastSlashIndex);
    var src = id.substring(lastSlashIndex + 1);

    const folder = this.getFolderForFolderId(folderId);

    if (folder) {
      return folder.sounds.find(sound => sound.src === src) || null;
    }

    return null;
  }

  getSoundForPath(id: string): SoundData | null {
    var lastSlashIndex = id.lastIndexOf('/');
    var folderPath = id.substring(0, lastSlashIndex);
    var src = id.substring(lastSlashIndex + 1);

    const folder = this.getFolderForFolderPath(folderPath);

    if (folder) {
      return folder.sounds.find(sound => sound.src === src) || null;
    }

    return null;
  }

  getFolderForId(id: string): SoundFolder | null {
    var lastSlashIndex = id.lastIndexOf('/');
    var folderId = id.substring(0, lastSlashIndex);

    return this.getFolderForFolderId(folderId);
  }

  getFolderForFolderId(folderId: string): SoundFolder | null {
    return this.folders.find(folder => folder.id === folderId) || null;
  }

  getFolderForFolderPath(folderPath: string): SoundFolder | null {
    return this.folders.find(folder => folder.path === folderPath) || null;
  }

  // A progression step might specify a smaller set of allowed sounds.
  setAllowedSounds(allowedSounds: Sounds): void {
    this.allowedSounds = allowedSounds;
  }

  // A sound picker might want to show the subset of sounds permitted by the
  // progression's currently allowed sounds.
  getAllowedSounds(folderType: string | undefined): SoundFolder[] {
    // Let's just do a deep copy and then do filtering in-place.
    let foldersCopy: SoundFolder[] = JSON.parse(
      JSON.stringify(this.folders)
    ) as SoundFolder[];

    // Whether or not we have allowedSounds, we need to filter by type.
    foldersCopy = foldersCopy.filter(
      (folder: SoundFolder) => folder.type === folderType
    );

    if (this.allowedSounds) {
      foldersCopy = foldersCopy.filter(
        (folder: SoundFolder) => this.allowedSounds?.[folder.id]
      );

      foldersCopy.forEach((folder: SoundFolder) => {
        folder.sounds = folder.sounds.filter((sound: SoundData) =>
          this.allowedSounds?.[folder.id]?.includes(sound.src)
        );
      });
    }

    return foldersCopy;
  }

  getBPM(): number | undefined {
    return this.bpm;
  }

  getKey(): Key | undefined {
    return this.key;
  }
}

export const LibraryValidator: ResponseValidator<LibraryJson> = response => {
  const libraryJson = response as LibraryJson;
  if (!libraryJson) {
    throw new Error(`Invalid library JSON: ${response}`);
  }
  return libraryJson;
};

export type SoundType = 'beat' | 'bass' | 'lead' | 'fx' | 'vocal';

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
  preview?: boolean;
  bpm?: number;
  key?: Key;
}

export type SoundFolderType = 'sound' | 'kit' | 'instrument';

export interface SoundFolder {
  name: string;
  id: string;
  type?: SoundFolderType;
  path: string;
  imageSrc: string;
  sounds: SoundData[];
}

export type LibraryJson = {
  id: string;
  name: string;
  imageSrc: string;
  path: string;
  bpm?: number;
  key?: string;
  defaultSound?: string;
  folders: SoundFolder[];
  instruments: SoundFolder[];
  kits: SoundFolder[];
  packs: SoundFolder[];
};

interface Sounds {
  [index: string]: [string];
}
