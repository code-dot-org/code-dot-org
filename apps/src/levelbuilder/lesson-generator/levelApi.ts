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

// GET /levels/by_name — exact-name lookup. Returns the level summary or
// 404 if no level of the given type has that name. Avoids the LIKE
// %name% scan that get_filtered_levels does.
async function findLevelByName(
  type: LabType,
  name: string
): Promise<{id: number; name: string} | null> {
  const params = new URLSearchParams({
    name,
    type: RAILS_TYPE_BY_LAB[type],
  });
  try {
    const {value} = await HttpClient.fetchJson<{id: string; name: string}>(
      `/levels/by_name?${params}`
    );
    return value?.id ? {id: Number(value.id), name: value.name} : null;
  } catch (err) {
    if (isNetworkError(err) && err.response.status === 404) return null;
    return null;
  }
}

// PATCH /levels/:id — write panel data into a Panels level. We post as
// multipart/form-data to mirror the panels-edit form, since the levels
// controller expects level[panels] as a JSON string and runs it through
// handle_json_params.
export async function updatePanelsLevel(
  levelId: number,
  panels: Panel[]
): Promise<void> {
  const form = new FormData();
  form.append('level[panels]', JSON.stringify(panels));
  // Clear out any stale level_data so we don't keep an old "panels" array
  // hidden in there. EditPanels does the same on save.
  form.append('level[level_data]', JSON.stringify({}));
  // Rails resources route both PATCH and PUT to :update; use PUT since
  // HttpClient doesn't have a patch helper.
  await HttpClient.put(`/levels/${levelId}`, form, true);
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
export async function updateLevelProperty(
  levelId: number,
  property: string,
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
  generateOutline?: string
): Promise<void> {
  const body: Record<string, string> = {
    activities: JSON.stringify(activities),
  };
  if (generateOutline !== undefined) {
    body.generate_outline = generateOutline;
  }
  await HttpClient.put(`/lessons/${lessonId}`, JSON.stringify(body), true, {
    'Content-Type': 'application/json;charset=UTF-8',
    Accept: 'application/json',
  });
}
