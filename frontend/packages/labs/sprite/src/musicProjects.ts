// The play-music block's songs: the user's Music Lab projects on the default
// sound pack, which is the pack scene music plays from.
import {DashboardApiClient, type PersonalProject} from '@code-dot-org/core/api';

import {PLAY_MUSIC_BLOCK_TYPE} from './blockly/blockDefinitions/playMusic';
import type {MusicProjectOption} from './redux/spriteLab2Redux';
import {collectSavedFieldValues} from './scenesApi';
import type {Scene} from './types';

const MUSIC_PROJECT_TYPE = 'music';

/** The user's Music Lab songs kept on the default sound pack, newest first. */
export async function fetchMusicProjects(): Promise<MusicProjectOption[]> {
  const [projects, {isOnDefaultPack}] = await Promise.all([
    DashboardApiClient.projects.getPersonal(),
    // Music's player modules come with this; a lab without songs never loads them.
    import('@code-dot-org/music-lab/player'),
  ]);
  return musicProjectOptions(projects, isOnDefaultPack);
}

export function musicProjectOptions(
  projects: PersonalProject[],
  isOnDefaultPack: (labConfig?: {music?: {packId?: string}}) => boolean,
  today = new Date(),
): MusicProjectOption[] {
  return projects
    .filter(
      p =>
        p.type === MUSIC_PROJECT_TYPE &&
        p.channel &&
        isOnDefaultPack(
          (p.labConfig ?? undefined) as {music?: {packId?: string}},
        ),
    )
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    .map(p => ({channel: p.channel, name: songLabel(p, today)}));
}

/** The songs saved play-music blocks refer to. */
export function collectSavedSongs(scenes: Scene[]): string[] {
  return collectSavedFieldValues(scenes, PLAY_MUSIC_BLOCK_TYPE, 'SONG');
}

/**
 * The list with a placeholder for each saved song it lacks, so the saved
 * block keeps its value through Blockly's option check instead of falling
 * back to another song.
 */
export function withUnavailableSongs(
  options: MusicProjectOption[],
  savedSongs: string[],
): MusicProjectOption[] {
  const known = new Set(options.map(o => o.channel));
  return [
    ...options,
    ...savedSongs
      .filter(channel => !known.has(channel))
      .map(channel => ({channel, name: '(unavailable)', unavailable: true})),
  ];
}

// Music Lab names most songs alike, so the day it was last saved tells them
// apart: "Untitled Project · Aug 25", with the year when it isn't this one.
function songLabel(project: PersonalProject, today: Date): string {
  const name = project.name || 'Untitled song';
  const saved = project.updatedAt ? new Date(project.updatedAt) : null;
  if (!saved || isNaN(saved.getTime())) {
    return name;
  }
  const date = saved.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(saved.getFullYear() !== today.getFullYear() && {year: 'numeric'}),
  });
  return `${name} · ${date}`;
}
