// Define the set of entrypoints for Lab2-based labs
//
// Want to add a new lab?
// - This is one of the main files you'll have to edit
// - Here's an example PR: https://github.com/code-dot-org/code-dot-org/pull/55952/files
// - Read the Lab2 Architecture doc: https://docs.google.com/document/d/1a8fPxd4mvV7LdhxGOCuCzTs4cmNt0o18CwpcH2KeGBU/edit#heading=h.td4mrmujd2i9
// - Please use lazy-loading
//
// Note: old-style "lab1" labs use a different system, see webpackEntryPoints.js

import aichatEntryPoint from '@cdo/apps/aichat/entrypoint';
import danceEntryPoint from '@cdo/apps/dance/lab2/entrypoint';
import type {Lab2EntryPoint} from '@cdo/apps/lab2/types';
import musicEntryPoint from '@cdo/apps/music/entrypoint';
import panelsEntryPoint from '@cdo/apps/panels/entrypoint';
import pythonlabEntryPoint from '@cdo/apps/pythonlab/entrypoint';
import standaloneVideoEntryPoint from '@cdo/apps/standaloneVideo/entrypoint';
import weblab2EntryPoint from '@cdo/apps/weblab2/entrypoint';

export default {
  aichat: aichatEntryPoint,
  dance: danceEntryPoint,
  music: musicEntryPoint,
  panels: panelsEntryPoint,
  pythonlab: pythonlabEntryPoint,
  standalone_video: standaloneVideoEntryPoint,
  weblab2: weblab2EntryPoint,
} as Record<string, Lab2EntryPoint>;
