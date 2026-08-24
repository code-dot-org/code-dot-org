/*
 * All Lab2-based labs must be registered here.
 *
 * Want to add a new lab? See ./src/lab2/README.md: 'How to Create a New Lab'
 * If you are going to pattern after one lab, start with pythonlab (2024).
 *
 * Note: old-style "lab1" labs use a different system, see webpackEntryPoints.js
 */

import {AIChatEntryPoint} from '@cdo/apps/aichatLab/entrypoint';
import {AilabEntryPoint} from '@cdo/apps/ailab/lab2/entrypoint';
import {BubbleChoiceEntryPoint} from '@cdo/apps/bubbleChoice/entrypoint';
import {BuildlabEntryPoint} from '@cdo/apps/buildlab/entrypoint';
import {DanceEntryPoint} from '@cdo/apps/dance/lab2/entrypoint';
import {JavalabEntryPoint} from '@cdo/apps/javalab/lab2/entrypoint';
import type {Lab2EntryPoint} from '@cdo/apps/lab2/types';
import {MusicEntryPoint} from '@cdo/apps/music/entrypoint';
import {SpriteLab2EntryPoint} from '@cdo/apps/p5lab/spritelab/lab2/entrypoint';
import {PanelsEntryPoint} from '@cdo/apps/panels/entrypoint';
import {PythonlabEntryPoint} from '@cdo/apps/pythonlab/entrypoint';
import {SketchlabEntryPoint} from '@cdo/apps/sketchlab/entrypoint';
import {StandaloneVideoEntryPoint} from '@cdo/apps/standaloneVideo/entrypoint';
import {Weblab2EntryPoint} from '@cdo/apps/weblab2/entrypoint';

export const lab2EntryPoints = {
  aichat: AIChatEntryPoint,
  ailab: AilabEntryPoint,
  buildlab: BuildlabEntryPoint,
  bubble_choice: BubbleChoiceEntryPoint,
  dance: DanceEntryPoint,
  javalab: JavalabEntryPoint,
  music: MusicEntryPoint,
  panels: PanelsEntryPoint,
  pythonlab: PythonlabEntryPoint,
  standalone_video: StandaloneVideoEntryPoint,
  weblab2: Weblab2EntryPoint,
  sketchlab: SketchlabEntryPoint,
  // Sprite Lab opts into Lab2 per-level via uses_lab2 on the classic
  // GamelabJr/spritelab level type; appName is the spritelab game's app, so we
  // register the new client view under that key (not a new "spritelab2" game).
  spritelab: SpriteLab2EntryPoint,
} as const satisfies Record<string, Lab2EntryPoint>;
