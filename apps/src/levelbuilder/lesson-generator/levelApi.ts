import {LevelPropertiesMapValidator} from '@cdo/apps/lab2/responseValidators';
import {LevelPropertiesMap, MultiFileSource} from '@cdo/apps/lab2/types';
import {Panel} from '@cdo/apps/panels/types';
import HttpClient, {isNetworkError} from '@cdo/apps/util/HttpClient';

import {LabType, RAILS_TYPE_BY_LAB, SerializedActivity} from './types';

export interface CreatedLevel {
  id: number;
  name: string;
  reused: boolean;
}

// Look up a level by name first; fall back to POST /levels if it doesn't
// exist. Looking up first avoids the noisy 406 "name has already been
// taken" round-trip that the levelbuilder regenerates an existing level
// would otherwise produce. The 406 fallback is still here for the rare
// race where another tab creates the level between our find and our POST.
//
// POST passes `do_not_redirect=true` so the controller returns the created
// Level record as JSON instead of a redirect URL.
export async function createOrFindLevel(
  type: LabType,
  name: string
): Promise<CreatedLevel> {
  const existing = await findLevelByName(type, name);
  if (existing) return {...existing, reused: true};

  try {
    const response = await HttpClient.post(
      '/levels?do_not_redirect=true',
      JSON.stringify({
        type: RAILS_TYPE_BY_LAB[type],
        name,
        published: true,
      }),
      true,
      {
        'Content-Type': 'application/json;charset=UTF-8',
        Accept: 'application/json',
      }
    );
    const created = await response.json();
    return {id: created.id, name: created.name, reused: false};
  } catch (err) {
    if (isNetworkError(err) && err.response.status === 406) {
      const body = await err.response.text();
      if (/name has already been taken/i.test(body)) {
        const racy = await findLevelByName(type, name);
        if (racy) return {...racy, reused: true};
      }
      throw new Error(`Failed to create level "${name}": 406 ${body}`);
    }
    throw err;
  }
}

// GET /levels/by_name — exact-name lookup. Returns the level summary, or
// an empty body if no level of the given type has that name (200, not
// 404, since "doesn't exist yet" is an expected probe result). Avoids the
// LIKE %name% scan that get_filtered_levels does.
async function findLevelByName(
  type: LabType,
  name: string
): Promise<{id: number; name: string} | null> {
  const params = new URLSearchParams({
    name,
    type: RAILS_TYPE_BY_LAB[type],
  });
  const {value} = await HttpClient.fetchJson<{id?: string; name?: string}>(
    `/levels/by_name?${params}`
  );
  return value?.id && value.name
    ? {id: Number(value.id), name: value.name}
    : null;
}

// Write panel data into a freshly-created Panels level. The level was
// produced by this page's createOrFindLevel a moment ago, so there's
// no stale level_data to worry about — we just write the new panels
// array through the same generic property path everything else uses.
export async function updatePanelsLevel(
  levelId: number,
  panels: Panel[]
): Promise<void> {
  await updateLevelProperty(levelId, 'panels', JSON.stringify(panels));
}

// POST /levels/:id/update_start_code — write start_sources into a Weblab2
// level. The controller forwards everything in the body to update_properties,
// so this is the same payload shape used by the codebridge save button.
export async function updateStartSources(
  levelId: number,
  startSources: MultiFileSource
): Promise<void> {
  await HttpClient.post(
    `/levels/${levelId}/update_start_code`,
    JSON.stringify({start_sources: startSources}),
    true,
    {
      'Content-Type': 'application/json;charset=UTF-8',
      Accept: 'application/json',
    }
  );
}

// PATCH /levels/:id — write a single string-valued serialized property on
// the level. The levels controller's level_params allow-list pulls in
// every serialized_attrs entry from the level subclass via
// Level.permitted_params, so any name accepted there works here. Goes
// over PUT because Rails routes both PATCH and PUT to :update and
// HttpClient lacks a patch helper.
// Narrow the property name to keys this page actually writes. The level
// edit controller would accept any permitted attribute, but limiting the
// call sites here catches typos at the boundary and documents intent.
export type LevelProperty = 'long_instructions' | 'generate_outline' | 'panels';

export async function updateLevelProperty(
  levelId: number,
  property: LevelProperty,
  value: string
): Promise<void> {
  const form = new FormData();
  form.append(`level[${property}]`, value);
  await HttpClient.put(`/levels/${levelId}`, form, true);
}

// POST /level_assets/upload — upload an image and return the public URL.
// Used by the panels editor on the level edit page; we reuse it so generated
// images live in the same place as hand-uploaded ones.
export async function uploadLevelAsset(
  data: Uint8Array,
  filename: string,
  mediaType: string
): Promise<string> {
  const blob = new Blob([data.buffer as ArrayBuffer], {type: mediaType});
  const form = new FormData();
  form.append('file', blob, filename);
  const response = await HttpClient.post('/level_assets/upload', form, true);
  const result = await response.json();
  if (!result.newAssetUrl) {
    throw new Error(`Failed to upload asset: ${result?.message || 'unknown'}`);
  }
  return result.newAssetUrl;
}

// GET /lessons/:id/level_properties — fetch the camelCased properties bag
// for every level in this lesson, keyed by level id (as a string). Used by
// the generator to feed full content of skipped levels into the continuity
// context for subsequent generations, so the AI has visibility into the
// levels we're not regenerating.
export async function loadLessonLevelProperties(
  lessonId: number
): Promise<LevelPropertiesMap> {
  const {value} = await HttpClient.fetchJson<LevelPropertiesMap>(
    `/lessons/${lessonId}/level_properties`,
    undefined,
    LevelPropertiesMapValidator
  );
  return value;
}

// PUT /lessons/:id — replace the lesson's activity tree wholesale, and
// optionally update the persisted /generate outline at the same time. The
// caller is responsible for building a complete activities array (including
// any new script_levels in their final positions); this function just
// serializes it and posts. The server's update_activities/update_activity_sections
// pipeline does the diff.
export async function saveLessonActivities(
  lessonId: number,
  activities: SerializedActivity[],
  generateOutline?: string,
  generateProjectChannelId?: string
): Promise<void> {
  const body: Record<string, string> = {
    activities: JSON.stringify(activities),
  };
  if (generateOutline !== undefined) {
    body.generate_outline = generateOutline;
  }
  if (generateProjectChannelId !== undefined) {
    // Sent on every save when the field is present in state; '' clears
    // the persisted value, so a user can blank out the input and have
    // it stick.
    body.generate_project_channel_id = generateProjectChannelId;
  }
  await HttpClient.put(`/lessons/${lessonId}`, JSON.stringify(body), true, {
    'Content-Type': 'application/json;charset=UTF-8',
    Accept: 'application/json',
  });
}

// Re-export the lab2 sources `get` helper under a clearer name. The
// page uses the response as additional context for the AI, not state
// it round-trips — formatTargetProject narrows the typed result down
// to MultiFileSource files.
export {get as loadProjectSources} from '@cdo/apps/lab2/projects/sourcesApi';
