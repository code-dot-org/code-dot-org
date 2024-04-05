import {ResponseValidator} from '@cdo/apps/util/HttpClient';
import {Key} from '../utils/Notes';
import {baseAssetUrlRestricted} from '../constants';
import {getBaseAssetUrl} from '../appConfig';

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
  private currentPackId: string | null;
  private hasRestrictedPacks: boolean;

  // BPM & Key associated with this library, or undefined if not present.
  private bpm: number | undefined;
  private key: Key | undefined;

  // The available sound types in this library.
  private availableSoundTypes: {[key: string]: boolean};

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
      this.key = libraryJson.key;
    }

    this.currentPackId = null;

    this.hasRestrictedPacks = libraryJson.packs.some(pack => pack.restricted);

    // Take this opportunity to determine the available sound types in this library.
    this.availableSoundTypes = {};
    this.determineAvailableSoundTypes();
  }

  setCurrentPackId(packId: string) {
    this.currentPackId = packId;
  }

  getHasRestrictedPacks(): boolean {
    return this.hasRestrictedPacks;
  }

  // Determine the available sound types available in this library.
  // Only currently-allowed sounds from packs are included.
  private determineAvailableSoundTypes() {
    const folders = this.getAllowedSounds(undefined, false);

    folders.forEach(folder => {
      folder.sounds.forEach(sound => {
        this.availableSoundTypes[sound.type] = true;
      });
    });
  }

  // Get the available sound types available in this library.
  // This is called by SoundsPanel to determine which filters to show.
  getAvailableSoundTypes() {
    return this.availableSoundTypes;
  }

  getDefaultSound(): string | undefined {
    // Return the specified default sound if there is one.
    if (this.libraryJson?.defaultSound) {
      return this.libraryJson?.defaultSound;
    }

    // The fallback is the first non-instrument/kit folder's first non-preview sound.
    // We will skip restricted folders unless it's the currently selected pack.
    const firstFolder = this.folders.find(
      group =>
        !group.type && (!group.restricted || group.id === this.currentPackId)
    );
    const firstSound = firstFolder?.sounds.find(
      sound => sound.type !== 'preview'
    );
    return `${firstFolder?.id}/${firstSound?.src}`;
  }

  // Given a sound ID (e.g. "pack1/sound1"), return the SoundData.
  getSoundForId(id: string): SoundData | null {
    const lastSlashIndex = id.lastIndexOf('/');
    const folderId = id.substring(0, lastSlashIndex);
    const src = id.substring(lastSlashIndex + 1);

    const folder = this.getFolderForFolderId(folderId);

    if (folder) {
      return folder.sounds.find(sound => sound.src === src) || null;
    }

    return null;
  }

  // Given a sound ID (e.g. "pack1/sound1"), return the SoundFolder.
  getFolderForSoundId(id: string): SoundFolder | null {
    const lastSlashIndex = id.lastIndexOf('/');
    const folderId = id.substring(0, lastSlashIndex);

    return this.getFolderForFolderId(folderId);
  }

  // Given a folder ID (e.g. "pack1") return the SoundFolder.
  getFolderForFolderId(folderId: string): SoundFolder | null {
    return this.folders.find(folder => folder.id === folderId) || null;
  }

  // Given a folderType and a sound ID (e.g. "pack1/sound1"), return only an
  // allowed SoundFolder containing the allowed sounds.
  getAllowedFolderForSoundId(
    folderType: string | undefined,
    id: string
  ): SoundFolder | null {
    const lastSlashIndex = id.lastIndexOf('/');
    const folderId = id.substring(0, lastSlashIndex);

    return this.getAllowedFolderForFolderId(folderType, folderId);
  }

  // Given a folderType and a folder ID (e.g. "pack1"), return only an
  // allowed SoundFolder containing the allowed sounds.
  getAllowedFolderForFolderId(
    folderType: string | undefined,
    folderId: string
  ): SoundFolder | null {
    const folders = this.getAllowedSounds(folderType, false);
    return folders.find(folder => folder.id === folderId) || null;
  }

  // A progression step might specify a smaller set of allowed sounds.
  setAllowedSounds(allowedSounds: Sounds): void {
    this.allowedSounds = allowedSounds;
  }

  generateSoundUrl(folder: SoundFolder, soundData: SoundData): string {
    const baseUrl = soundData.restricted
      ? baseAssetUrlRestricted
      : getBaseAssetUrl();

    const optionalSoundPath = soundData.path ? `${soundData.path}/` : '';
    return `${baseUrl}${this.libraryJson.path}/${folder.path}/${optionalSoundPath}${soundData.src}.mp3`;
  }

  // A sound picker might want to show the subset of sounds permitted by the
  // progression's currently allowed sounds.
  getAllowedSounds(
    folderType: string | undefined,
    enumerateRestrictedPacks: boolean
  ): SoundFolder[] {
    // Let's just do a deep copy and then do filtering in-place.
    let foldersCopy: SoundFolder[] = JSON.parse(
      JSON.stringify(this.folders)
    ) as SoundFolder[];

    // Whether or not we have allowedSounds, we need to filter by type.
    // If we are enumerating restricted packs, then we only allow them.
    // If we are enumerating available sounds, then we only allow
    // restricted sounds if they are the current pack.
    foldersCopy = foldersCopy.filter(
      (folder: SoundFolder) =>
        folder.type === folderType &&
        ((!this.currentPackId &&
          enumerateRestrictedPacks &&
          folder.restricted) ||
          (!this.currentPackId &&
            !enumerateRestrictedPacks &&
            !folder.restricted) ||
          (this.currentPackId &&
            (!folder.restricted || this.currentPackId === folder.id)))
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

export type SoundType = 'beat' | 'bass' | 'lead' | 'fx' | 'vocal' | 'preview';

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
  path?: string;
  src: string;
  length: number;
  type: SoundType;
  note?: number;
  restricted?: boolean;
  sequence?: SampleSequence;
  bpm?: number;
  key?: Key;
}

export type SoundFolderType = 'sound' | 'kit' | 'instrument';

export interface SoundFolder {
  name: string;
  artist?: string;
  id: string;
  type?: SoundFolderType;
  path: string;
  imageSrc: string;
  restricted?: boolean;
  sounds: SoundData[];
  bpm?: number;
  key?: string;
}

export type LibraryJson = {
  id: string;
  name: string;
  imageSrc: string;
  path: string;
  bpm?: number;
  key?: number;
  defaultSound?: string;
  folders: SoundFolder[];
  instruments: SoundFolder[];
  kits: SoundFolder[];
  packs: SoundFolder[];
};

interface Sounds {
  [index: string]: [string];
}
