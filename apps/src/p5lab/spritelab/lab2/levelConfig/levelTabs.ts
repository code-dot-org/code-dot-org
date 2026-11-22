import type {Tab} from '../redux/spriteLab2Redux';

import {editableParts, Focus, LevelConfig} from './schema';

const TAB_OF: Record<Focus, Tab> = {
  code: 'Code',
  images: 'Images',
  world: 'World',
  play: 'Play',
};

/**
 * The tabs a level shows, the first being where it opens. Each part the
 * student can change has its tab. Play is always added, except when the
 * focus is images and images are the only part the student can change.
 */
export function levelTabs(config: LevelConfig): Tab[] {
  const parts = editableParts(config);
  const focus = config.focus ?? 'code';
  const imagesOnly =
    focus === 'images' && !parts.includes('code') && !parts.includes('world');
  const shown: Tab[] = [
    ...parts.map(part => TAB_OF[part]),
    ...(imagesOnly ? [] : ['Play' as const]),
  ];
  const opensOn =
    config.images?.makeFirst && parts.includes('images')
      ? 'Images'
      : TAB_OF[focus];
  return [opensOn, ...shown.filter(tab => tab !== opensOn)];
}

/** Whether the level's work is placing images on the World grid. */
export function editsWorld(config: LevelConfig): boolean {
  const parts = editableParts(config);
  const focus = config.focus ?? 'code';
  return (
    focus === 'world' ||
    (focus !== 'code' && !parts.includes('code') && parts.includes('world'))
  );
}
