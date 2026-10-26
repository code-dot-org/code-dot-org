// The backdrop shelf and the list behind it.
//
// Three things have to agree, and none of them can see the other two at
// runtime: `backgrounds.txt` (what setup downloads), `stockBackgrounds.ts` (what
// the picker offers, generated from that list), and the URL the import fetches.
// A name that drifts between them is a tile in the picker whose bytes 404 —
// and it drifts silently, because the file it wants is one nobody committed.

import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {beforeEach, describe, expect, it} from 'vitest';

import {
  backgroundFileName as urlFileName,
  backgroundUrls,
} from '../../scripts/stockBackgroundNames.mjs';
import {
  backgroundFileName,
  backgroundLabel,
  stockBackground,
  stockBackgrounds,
} from '../appearance/stock';
import {STOCK_BACKGROUND_IDS} from '../appearance/stockBackgrounds';
import {
  getBackgroundBaseUrl,
  setBackgroundBaseUrl,
} from '../runtime/worldConfig';

// From the package root: `import.meta.url` is not a file URL under vitest.
const listing = readFileSync(join(process.cwd(), 'backgrounds.txt'), 'utf8');

describe('the stock backdrop shelf', () => {
  beforeEach(() => setBackgroundBaseUrl('/backgrounds/'));

  it('offers exactly what backgrounds.txt names', () => {
    // `stockBackgrounds.ts` is generated (scripts/write-stock-backgrounds.mjs);
    // a URL added to the list without re-running it is art nobody can reach.
    const downloaded = backgroundUrls(listing).map(url =>
      urlFileName(url).replace(/\.png$/, ''),
    );
    expect([...STOCK_BACKGROUND_IDS].sort()).toEqual([...downloaded].sort());
    expect(downloaded.length).toBeGreaterThan(0);
  });

  it('asks for each one where setup put it', () => {
    for (const background of stockBackgrounds()) {
      expect(background.url).toBe(
        `/backgrounds/${backgroundFileName(background.id)}`,
      );
    }
  });

  it('follows the base URL the host sets, whenever it is set', () => {
    // Resolved per call, not at import: the host may configure this after this
    // module has loaded, and a shelf built once would keep the default.
    setBackgroundBaseUrl('https://studio.example/world/backgrounds');
    expect(stockBackground('cave')?.url).toBe(
      'https://studio.example/world/backgrounds/cave.png',
    );
    // A base without its trailing slash is still a base.
    expect(getBackgroundBaseUrl()).toMatch(/\/$/);
  });

  it('has a name for every one, from its id', () => {
    expect(backgroundLabel('cave')).toBe('Cave');
    expect(backgroundLabel('sunAndRainbow')).toBe('Sun and rainbow');
    expect(backgroundLabel('frontOfHouse')).toBe('Front of house');
    for (const background of stockBackgrounds()) {
      expect(background.name, background.id).not.toBe('');
    }
  });

  it('knows nothing of an id it was never given', () => {
    expect(stockBackground('nosuch')).toBeUndefined();
  });
});
