/*
 * All Lab2-based labs must be registered here.
 *
 * Want to add a new lab? See ./src/lab2/README.md: 'How to Create a New Lab'
 * If you are going to pattern after one lab, start with pythonlab (2024).
 *
 * Note: old-style "lab1" labs use a different system, see webpackEntryPoints.js
 */

import {AIChatEntryPoint} from '@cdo/apps/aichat/entrypoint';
import {DanceEntryPoint} from '@cdo/apps/dance/lab2/entrypoint';
import type {Lab2EntryPoint} from '@cdo/apps/lab2/types';
import {MusicEntryPoint} from '@cdo/apps/music/entrypoint';
import {PanelsEntryPoint} from '@cdo/apps/panels/entrypoint';
import {PythonlabEntryPoint} from '@cdo/apps/pythonlab/entrypoint';
import {StandaloneVideoEntryPoint} from '@cdo/apps/standaloneVideo/entrypoint';
import {Weblab2EntryPoint} from '@cdo/apps/weblab2/entrypoint';

export const lab2EntryPoints: Record<string, Lab2EntryPoint> = {
  aichat: AIChatEntryPoint,
  dance: DanceEntryPoint,
  music: MusicEntryPoint,
  panels: PanelsEntryPoint,
  pythonlab: PythonlabEntryPoint,
  standalone_video: StandaloneVideoEntryPoint,
  weblab2: Weblab2EntryPoint,
};
