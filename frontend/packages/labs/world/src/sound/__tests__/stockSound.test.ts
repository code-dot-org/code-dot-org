// The sound shelf, and copying from it (specs/SOUND.md).
//
// A curated subset of Sprite Lab's library, vendored because the standalone
// demo has no code.org origin to ask. What has to be true is what is true of
// the backdrop shelf: an id names a file, the shelf and the importer agree
// about that name, and importing one leaves everything already in the project
// where it was.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {setSoundBaseUrl} from '../../runtime/worldConfig';
import {importStockSound} from '../importStockSound';
import {isSoundFile, SOUNDS_FOLDER} from '../soundFiles';
import {soundFileName, soundLabel, stockSound, stockSounds} from '../stock';
import {STOCK_SOUND_IDS} from '../stockSounds';

const empty = (): MultiFileSource => ({
  folders: {},
  files: {},
});

const named = (source: MultiFileSource, name: string) =>
  Object.values(source.files).find(file => file.name === name);

describe('the shelf', () => {
  it('offers every id the manifest lists', () => {
    expect(stockSounds()).toHaveLength(STOCK_SOUND_IDS.length);
    expect(stockSounds().map(sound => sound.id)).toEqual([...STOCK_SOUND_IDS]);
  });

  it('has the vocabulary a first game reaches for', () => {
    // Not a list to keep in step — a handful, so that "there is a coin sound"
    // is a fact and not a hope. Curation is `sounds.txt`'s business; this is
    // the floor beneath it.
    const ids = new Set(STOCK_SOUND_IDS);
    for (const id of ['jump', 'coin', 'hit', 'explosion', 'pop', 'win']) {
      expect(ids.has(id)).toBe(true);
    }
    // …and something for `set music to`, which a shelf of one-shots cannot
    // serve.
    expect(STOCK_SOUND_IDS.some(id => id.endsWith('Loop'))).toBe(true);
  });

  it('serves each one from the sound base URL', () => {
    setSoundBaseUrl('https://example.test/sounds');

    expect(stockSound('coin')?.url).toBe(
      'https://example.test/sounds/coin.mp3',
    );

    setSoundBaseUrl('/sounds/');
  });

  it('names them as words', () => {
    // The id is an identifier because it becomes a file name and a block value;
    // the label is what a person reads, derived rather than listed so the two
    // cannot drift.
    expect(soundLabel('bigJump')).toBe('big jump');
    expect(soundLabel('coin')).toBe('coin');
  });

  it('answers with nothing for an id it does not have', () => {
    expect(stockSound('nosuchsound')).toBeUndefined();
  });

  it('names files the driver will recognise as sounds', () => {
    // The shelf and `soundFiles` have to agree, or an imported sound is loaded
    // as a texture and never plays.
    for (const id of STOCK_SOUND_IDS) {
      expect(isSoundFile(soundFileName(id))).toBe(true);
    }
  });
});

describe('importing one', () => {
  it('writes it into the sounds folder, as bytes', () => {
    const {source, value} = importStockSound(
      empty(),
      {id: 'coin'},
      'data:audio/mpeg;base64,AAAA',
    );

    expect(value).toBe('coin.mp3');
    const file = named(source, 'coin.mp3');
    expect(file?.url).toBe('data:audio/mpeg;base64,AAAA');
    expect(file?.mimeType).toBe('audio/mpeg');
    const folder = Object.values(source.folders).find(
      entry => entry.name === SOUNDS_FOLDER,
    );
    expect(file?.folderId).toBe(folder?.id);
  });

  it('hands back the name a block stores', () => {
    // The file name, as `set sprite` stores one — so the block, the project and
    // the driver's audio cache all say the same word.
    const {value} = importStockSound(empty(), {id: 'bigJump'}, 'data:,x');

    expect(value).toBe('bigJump.mp3');
  });

  it('does not overwrite a sound the project already has', () => {
    // The learner may have replaced it with their own. Importing again is a
    // no-op rather than a demolition (projectWrite).
    const first = importStockSound(empty(), {id: 'coin'}, 'data:,mine').source;

    const second = importStockSound(first, {id: 'coin'}, 'data:,theirs').source;

    expect(Object.keys(second.files)).toHaveLength(1);
    expect(named(second, 'coin.mp3')?.url).toBe('data:,mine');
  });

  it('reuses the folder rather than making a second one', () => {
    let source = importStockSound(empty(), {id: 'coin'}, 'data:,a').source;
    source = importStockSound(source, {id: 'jump'}, 'data:,b').source;

    expect(
      Object.values(source.folders).filter(f => f.name === SOUNDS_FOLDER),
    ).toHaveLength(1);
    expect(Object.keys(source.files)).toHaveLength(2);
  });
});

describe('telling the pools apart', () => {
  it('keeps sounds out of the sprite dropdown', async () => {
    // A sound is a file with bytes on a `url`, exactly as an image is, so the
    // list of url-bearing files was the sprite pool until sounds existed in it.
    // The extension is what separates them now (runtime/projectFiles).
    const {projectImagePaths, projectSoundPaths} = await import(
      '../../runtime/projectFiles'
    );
    const source = {
      folders: {},
      files: {
        '1': {
          id: '1',
          name: 'player.png',
          language: 'png',
          contents: '',
          folderId: '0',
          url: 'data:,a',
        },
        '2': {
          id: '2',
          name: 'coin.mp3',
          language: 'mp3',
          contents: '',
          folderId: '0',
          url: 'data:,b',
        },
      },
    } as never;

    expect(projectImagePaths(source)).toEqual(['player.png']);
    expect(projectSoundPaths(source)).toEqual(['coin.mp3']);
  });
});
