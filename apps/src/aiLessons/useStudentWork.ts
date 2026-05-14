// Reads the student's live in-progress work straight out of the Lab2 Redux
// store and formats it as a string the AI Tutor can read.  Used both for
// "Check my work" evaluations and to give every tutor message ambient
// context about what the student is doing.
//
// The shape of the snapshot is lab-specific:
// - weblab2: a multi-file source dump (filenames + contents) pulled from
//   state.lab2Project.projectSources.source.
// - music: the Blockly workspace serialization — the actual program the
//   student wrote, not the playback events that result from running it.
//   Pulled from state.lab2Project.projectSources.source (a JSON string of
//   the Blockly workspace) plus the labConfig metadata (pack, library,
//   block mode).  This lets the tutor verify "did you use a Repeat
//   block" rather than guessing from observed sound events.
// - panels: undefined; there's no code to check on instructional panels.

import {useMemo} from 'react';

import {MultiFileSource} from '@cdo/apps/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {selectSavedSource} from './aiLessonsSourcesRedux';
import {Checkpoint} from './types';

interface SerializedWeblab2File {
  name: string;
  contents: string;
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

interface MusicLabConfig {
  music?: {
    packId?: string;
    library?: string;
    blockMode?: string;
  };
}

function serializeMusicSource(
  source: unknown,
  labConfig: MusicLabConfig | undefined
): string {
  const lines: string[] = ['Music Lab project — Blockly workspace JSON.'];
  const music = labConfig?.music;
  if (music?.library) lines.push(`Sound library: ${music.library}`);
  if (music?.packId) lines.push(`Sound pack: ${music.packId}`);
  if (music?.blockMode) lines.push(`Block mode: ${music.blockMode}`);
  lines.push('');

  // MusicView serializes `JSON.stringify(getCode())` into the `source`
  // field, so the redux value is typically a string.  Try to pretty-print
  // it back to JSON; if that fails fall back to the raw form.
  let pretty: string;
  if (typeof source === 'string') {
    try {
      pretty = JSON.stringify(JSON.parse(source), null, 2);
    } catch {
      pretty = source;
    }
  } else if (source !== undefined && source !== null) {
    try {
      pretty = JSON.stringify(source, null, 2);
    } catch {
      pretty = String(source);
    }
  } else {
    return 'Music Lab project — no workspace saved yet.';
  }
  lines.push(pretty);
  return lines.join('\n');
}

export function useStudentWork(checkpoint: Checkpoint): string | undefined {
  // Weblab2 source is in lab2Project (codebridge dispatches setProjectSource
  // on every keystroke).  Music source lives in our own slice because
  // dispatching into lab2Project would loop with MusicView's reload-on-
  // source-change behaviour.
  const weblab2Source = useAppSelector(
    state => state.lab2Project.projectSources?.source
  );
  const musicSaved = useAppSelector(state => selectSavedSource(state, 'music'));

  return useMemo(() => {
    if (checkpoint.labType === 'panels') {
      return undefined;
    }

    if (checkpoint.labType === 'music') {
      if (!musicSaved) return undefined;
      return serializeMusicSource(musicSaved.source, musicSaved.labConfig);
    }

    if (checkpoint.labType === 'weblab2') {
      if (!weblab2Source) return undefined;
      return serializeWeblab2Source(weblab2Source as MultiFileSource);
    }

    return undefined;
  }, [checkpoint.labType, weblab2Source, musicSaved]);
}
