import type {
  Instrument,
  Kit,
  LibraryJson,
  MusicApiClient,
  Pack,
  SoundFolder,
} from '../api';
import AppConfig, {getBaseAssetUrl} from '../appConfig';
import {baseAssetUrlRestricted, DEFAULT_PACK} from '../constants';
import type {Key} from '../utils/Notes';

import type {ImageAttributionCopyright, SoundData, Sounds} from './types';

/**
 * Loads a sound library JSON file.
 *
 * @param libraryName specific library to load. If a library is specified by
 * URL param, that will take precedence.
 * @returns the Music Library
 */
export async function loadLibrary(
  api: MusicApiClient,
  libraryName: string,
): Promise<MusicLibrary> {
  const libraryParameter = AppConfig.getValue('library') || libraryName;
  const libraryFilename = `music-library-${libraryParameter}`;

  const libraryJson = await api.music.getLibrary({
    library: libraryFilename,
  });

  return new MusicLibrary(libraryName, libraryJson);
}

export default class MusicLibrary {
  private static instance: MusicLibrary | undefined;
  public static libraryLoader?: Promise<MusicLibrary>;

  static async loadLibrary(
    api: MusicApiClient,
    libraryName: string,
  ): Promise<MusicLibrary> {
    if (this.instance?.name === libraryName) {
      return this.instance;
    }

    this.libraryLoader = loadLibrary(api, libraryName);
    this.instance = await this.libraryLoader;
    return this.instance;
  }

  static getInstance(): MusicLibrary | undefined {
    return this.instance;
  }

  name: string;

  packs: Pack[];
  instruments: Instrument[];
  kits: Kit[];

  private folders: SoundFolder[];

  private libraryJson: LibraryJson;
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
    this.availableSoundTypes = {};

    // Add notes for drum kits based on index if they don't already have them.
    for (const kit of libraryJson.kits) {
      kit.sounds = kit.sounds.map((sound, i) => ({
        ...sound,
        note: i,
      }));
    }

    // Combine the JSON-specified folders into one flat list of folders.
    this.folders = [
      ...libraryJson.packs,
      ...libraryJson.instruments,
      ...libraryJson.kits,
    ] as unknown as SoundFolder[];

    this.packs = libraryJson.packs;
    this.instruments = libraryJson.instruments;
    this.kits = libraryJson.kits;

    if (libraryJson.bpm !== undefined) {
      this.bpm = libraryJson.bpm;
    }

    if (libraryJson.key !== undefined) {
      this.key = libraryJson.key;
    }

    this.currentPackId = null;

    this.hasRestrictedPacks = libraryJson.packs.some(pack => pack.restricted);

    // Take this opportunity to determine the available sound types in this library.
    this.determineAvailableSoundTypes();
  }

  getPath() {
    return this.libraryJson.path;
  }

  setCurrentPackId(packId: string | null) {
    this.currentPackId = packId;

    // Take this opportunity to update the available sound types in this library.
    this.determineAvailableSoundTypes();
  }

  getHasRestrictedPacks(): boolean {
    return this.hasRestrictedPacks;
  }

  // Determine the available sound types available in this library.
  // Only currently-allowed sounds from packs are included.
  private determineAvailableSoundTypes() {
    const folders = this.getAvailableSounds();

    this.availableSoundTypes = {};

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

    // The fallback is the first available pack's first available non-preview sound.
    // We will skip restricted folders unless it's the currently selected pack.
    const firstFolder = this.getAvailableSounds()[0];
    const firstSound = firstFolder?.sounds.find(
      sound => sound.type !== 'preview',
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

  // Given a folder ID (e.g. "pack1", "kit1", or "instrument1") return the SoundFolder.
  getFolderForFolderId(folderId: string): SoundFolder | null {
    return this.folders.find(folder => folder.id === folderId) || null;
  }

  // Given a a sound ID (e.g. "pack1/sound1"), return only an
  // allowed SoundFolder containing the allowed sounds.
  getAllowedFolderForSoundId(id: string): SoundFolder | null {
    const lastSlashIndex = id.lastIndexOf('/');
    const folderId = id.substring(0, lastSlashIndex);

    return this.getAllowedFolderForFolderId(folderId);
  }

  // Given a folderType and a folder ID (e.g. "pack1"), return only an
  // allowed SoundFolder containing the allowed sounds.
  getAllowedFolderForFolderId(folderId: string): SoundFolder | null {
    const folders = this.getAllowedSounds();
    return folders.find(folder => folder.id === folderId) || null;
  }

  // Given a pack ID (e.g. "pack1"), return the path for its image.
  getPackImageUrl(packId: string): string | undefined {
    const folder = this.getFolderForFolderId(packId);
    if (!folder) {
      return undefined;
    }

    return (
      folder.imageSrc &&
      `${getBaseAssetUrl()}${this.libraryJson.path}/${folder.path}/${
        folder.imageSrc
      }`
    );
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

  getAvailableSounds() {
    return this.getAllowedSounds().filter(
      folder =>
        (!folder.restricted || this.currentPackId === folder.id) &&
        folder.id !== DEFAULT_PACK,
    );
  }

  getRestrictedPacks(): SoundFolder[] {
    return this.getAllowedSounds().filter(
      folder => folder.restricted && folder.id !== DEFAULT_PACK,
    );
  }

  getImageAttributions(): ImageAttributionCopyright[] {
    const attributions: ImageAttributionCopyright[] = [];

    this.getRestrictedPacks().map(pack => {
      const attribution = pack.imageAttribution;
      if (pack.artist && attribution?.author) {
        attributions.push({artist: pack.artist, ...attribution});
      }
    });

    return attributions;
  }

  // Return a deep copy of the packs folders only containing folders
  // and sounds currently allowed by the level.
  private getAllowedSounds(): SoundFolder[] {
    // Let's just do a deep copy and then do filtering in-place.
    let foldersCopy: SoundFolder[] = JSON.parse(
      JSON.stringify(this.packs),
    ) as SoundFolder[];

    if (this.allowedSounds) {
      foldersCopy = foldersCopy.filter(
        (folder: SoundFolder) => this.allowedSounds?.[folder.id],
      );

      foldersCopy.forEach((folder: SoundFolder) => {
        folder.sounds = folder.sounds.filter((sound: SoundData) =>
          this.allowedSounds?.[folder.id]?.includes(sound.src),
        );
      });
    }

    return foldersCopy;
  }

  // Returns the library BPM, or the BPM of the currently selected pack if present.
  getBPM(): number | undefined {
    if (!this.currentPackId) {
      return this.bpm;
    }
    const folder = this.getFolderForFolderId(this.currentPackId);
    // Read BPM from the folder, or the first sound that has a BPM if not present on the folder.
    return (
      folder?.bpm || folder?.sounds.find(sound => sound.bpm !== undefined)?.bpm
    );
  }

  // Returns the library key, or the key of the currently selected pack if present.
  getKey(): Key | undefined {
    if (!this.currentPackId) {
      return this.key;
    }
    const folder = this.getFolderForFolderId(this.currentPackId);
    // Read key from the folder, or the first sound that has a key if not present on the folder.
    return (
      folder?.key ?? folder?.sounds.find(sound => sound.key !== undefined)?.key
    );
  }

  getCurrentPackId(): string | null {
    return this.currentPackId;
  }

  // Returns true if the sound id is associated with an available sound; false otherwise
  isSoundIdAvailable(id: string): boolean {
    const lastSlashIndex = id.lastIndexOf('/');
    const folderId = id.substring(0, lastSlashIndex);
    const soundSrc = id.substring(lastSlashIndex + 1);

    const folder = this.getFolderForFolderId(folderId);
    if (!folder) {
      return false;
    }

    // Check if the sound exists in the available sounds of this folder.
    const availableSounds = this.getAvailableSounds();
    const availableFolder = availableSounds.find(f => f.id === folderId);

    return (
      availableFolder?.sounds.some(sound => sound.src === soundSrc) || false
    );
  }
}
