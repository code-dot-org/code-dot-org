// Define the set of entrypoints for Lab2-based labs
//
// Want to add a new lab?
// - This is one of the main files you'll have to edit
// - Here's an example PR: https://github.com/code-dot-org/code-dot-org/pull/55952/files
// - Read the Lab2 Architecture doc: https://docs.google.com/document/d/1a8fPxd4mvV7LdhxGOCuCzTs4cmNt0o18CwpcH2KeGBU/edit#heading=h.td4mrmujd2i9
// - Please use lazy-loading
//
// Note: old-style "lab1" labs use a different system, see webpackEntryPoints.js

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
