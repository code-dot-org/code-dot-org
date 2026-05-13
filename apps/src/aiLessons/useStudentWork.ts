// Reads the student's live in-progress work straight out of the Lab2 Redux
// store and formats it as a string the AI Tutor can read.  Used both for
// "Check my work" evaluations and to give every tutor message ambient
// context about what the student is doing.
//
// The shape of the snapshot is lab-specific:
// - weblab2: a multi-file source dump (filenames + contents) pulled from
//   state.lab2Project.projectSources.source.
// - music: a structured summary of the song the student has composed —
//   pack, BPM, last measure, and the list of playback events — read from
//   state.music (Music Lab doesn't write back into lab2Project).
// - panels: undefined; there's no code to check on instructional panels.

import {useMemo} from 'react';

import {MultiFileSource} from '@cdo/apps/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {Checkpoint} from './types';

interface SerializedWeblab2File {
  name: string;
  contents: string;
}

interface MusicLikeState {
  packId?: string | null;
  bpm?: number;
  lastMeasure?: number;
  playbackEvents?: Array<Record<string, unknown>>;
}

function serializeWeblab2Source(source: MultiFileSource): string {
  const files: SerializedWeblab2File[] = Object.values(source.files).map(f => ({
    name: f.name,
    contents: f.contents,
  }));
  return files
    .map(f => `--- ${f.name} ---\n${f.contents.trimEnd()}\n`)
    .join('\n');
}

function serializeMusicState(music: MusicLikeState): string {
  const lines: string[] = [
    `Music Lab project snapshot`,
    `Sound pack: ${music.packId ?? '(default)'}`,
    `BPM: ${music.bpm ?? '(unset)'}`,
    `Last measure used: ${music.lastMeasure ?? 0}`,
    `Number of playback events: ${music.playbackEvents?.length ?? 0}`,
  ];
  if (music.playbackEvents && music.playbackEvents.length > 0) {
    lines.push('Playback events:');
    music.playbackEvents.slice(0, 50).forEach((ev, i) => {
      lines.push(`  ${i + 1}. ${JSON.stringify(ev)}`);
    });
    if (music.playbackEvents.length > 50) {
      lines.push(`  …and ${music.playbackEvents.length - 50} more events`);
    }
  }
  return lines.join('\n');
}

export function useStudentWork(checkpoint: Checkpoint): string | undefined {
  const projectSource = useAppSelector(
    state => state.lab2Project.projectSources?.source
  );

  // state.music is registered lazily when the Music chunk loads; guard with
  // an unknown-narrowing dance the same way useAutoCheckOnRun does.
  const musicState = useAppSelector(state => {
    const s = state as unknown as {music?: MusicLikeState};
    return s.music;
  });

  return useMemo(() => {
    if (checkpoint.labType === 'panels') {
      return undefined;
    }

    if (checkpoint.labType === 'music') {
      if (!musicState) return undefined;
      return serializeMusicState(musicState);
    }

    if (checkpoint.labType === 'weblab2') {
      if (!projectSource) return undefined;
      return serializeWeblab2Source(projectSource as MultiFileSource);
    }

    return undefined;
  }, [checkpoint.labType, projectSource, musicState]);
}
