import HttpClient from '@cdo/apps/util/HttpClient';

import {MusicProjectOption} from './redux/spriteLab2Redux';

interface PersonalProject {
  channel: string;
  name?: string;
  type?: string;
  updatedAt?: string;
}

const MUSIC_PROJECT_TYPE = 'music';

/** The user's Music Lab projects, newest first. */
export async function fetchMusicProjects(): Promise<MusicProjectOption[]> {
  const {value} = await HttpClient.fetchJson<PersonalProject[]>(
    '/api/v1/projects/personal'
  );
  return musicProjectOptions(value);
}

export function musicProjectOptions(
  projects: PersonalProject[]
): MusicProjectOption[] {
  return projects
    .filter(p => p.type === MUSIC_PROJECT_TYPE && p.channel)
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    .map(p => ({channel: p.channel, name: p.name || 'Untitled song'}));
}
