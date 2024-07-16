// Define the set of entrypoints for Lab2-based labs
//
// Want to add a new lab?
// - This is one of the main files you'll have to edit
// - Here's an example PR: https://github.com/code-dot-org/code-dot-org/pull/55952/files
// - Read the Lab2 Architecture doc: https://docs.google.com/document/d/1a8fPxd4mvV7LdhxGOCuCzTs4cmNt0o18CwpcH2KeGBU/edit#heading=h.td4mrmujd2i9
// - Please use lazy-loading
//
// Note: old-style "lab1" labs use a different system, see webpackEntryPoints.js

import aichatEntrypoint from '@cdo/apps/aichat/entrypoint';
import danceEntrypoint from '@cdo/apps/dance/lab2/entrypoint';
import type {Lab2Entrypoint} from '@cdo/apps/lab2/types';
import musicEntrypoint from '@cdo/apps/music/entrypoint';
import panelsEntrypoint from '@cdo/apps/panels/entrypoint';
import pythonlabEntrypoint from '@cdo/apps/pythonlab/entrypoint';
import standaloneVideoEntrypoint from '@cdo/apps/standaloneVideo/entrypoint';
import weblab2Entrypoint from '@cdo/apps/weblab2/entrypoint';

export const lab2Entrypoints: Record<string, Lab2Entrypoint> = {
  aichat: aichatEntrypoint,
  dance: danceEntrypoint,
  music: musicEntrypoint,
  panels: panelsEntrypoint,
  pythonlab: pythonlabEntrypoint,
  standalone_video: standaloneVideoEntrypoint,
  weblab2: weblab2Entrypoint,
};
