import {isOnDefaultPack, SavedMusicLabConfig} from '@cdo/apps/music/utils/pack';
import HttpClient from '@cdo/apps/util/HttpClient';

import {PLAY_MUSIC_BLOCK_TYPE} from './blockly/blockDefinitions/playMusic';
import {MusicProjectOption} from './redux/spriteLab2Redux';
import {collectSavedFieldValues} from './scenesApi';
import {Scene} from './types';

interface PersonalProject {
  channel: string;
  name?: string;
  type?: string;
  updatedAt?: string;
  labConfig?: SavedMusicLabConfig;
}

const MUSIC_PROJECT_TYPE = 'music';

// The songs are the user's, so one fetch serves every level of a page
// session. A failed fetch clears the cache so the next
// level retries. A song made mid-session shows up on the next page load —
// the per-level fetch this replaces was no fresher within a level.
let cachedFetch: Promise<MusicProjectOption[]> | null = null;

/** The user's Music Lab songs kept on the default sound pack, newest first. */
export function fetchMusicProjects(): Promise<MusicProjectOption[]> {
  if (!cachedFetch) {
    cachedFetch = HttpClient.fetchJson<PersonalProject[]>(
      '/api/v1/projects/personal'
    ).then(
      ({value}) => musicProjectOptions(value),
      e => {
        cachedFetch = null;
        throw e;
      }
    );
  }
  return cachedFetch;
}

// Exported for tests.
export function musicProjectOptions(
  projects: PersonalProject[],
  today = new Date()
): MusicProjectOption[] {
  return projects
    .filter(
      p =>
        p.type === MUSIC_PROJECT_TYPE &&
        p.channel &&
        isOnDefaultPack(p.labConfig)
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
  savedSongs: string[]
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
