// Static imports so Vite includes these tile images in the module graph
// (and therefore the SW precache manifest). Each slug here MUST match a
// slug in `bundled-catalog.json` so `tileForSlug` can resolve it.
import applab from './tile-applab.webp';
import artist from './tile-artist.webp';
import dance from './tile-dance.webp';
import maze from './tile-maze.webp';
import music from './tile-music.webp';
import oceans from './tile-oceans.webp';
import spriteLab from './tile-sprite-lab.webp';
import weblab from './tile-weblab.webp';

const TILES: Record<string, string> = {
  'ai-for-oceans': oceans,
  music,
  maze,
  'sprite-lab': spriteLab,
  dance,
  applab,
  weblab,
  artist,
};

const FALLBACK = oceans;

/** Resolve the bundled illustration URL for a slug; falls back if unknown. */
export function tileForSlug(slug: string): string {
  return TILES[slug] ?? FALLBACK;
}
