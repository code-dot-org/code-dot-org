import {LevelPropertiesMapValidator} from '@cdo/apps/lab2/responseValidators';
import {LevelPropertiesMap, MultiFileSource} from '@cdo/apps/lab2/types';
import {Panel} from '@cdo/apps/panels/types';
import HttpClient, {isNetworkError} from '@cdo/apps/util/HttpClient';

import {LabType, SerializedActivity} from './types';

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
      JSON.stringify({type, name, published: true}),
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

// GET /levels/get_filtered_levels — find a level of the given type with an
// exact name match. The endpoint does a LIKE %name% search, so we filter
// the results client-side for the exact name we asked for.
async function findLevelByName(
  type: LabType,
  name: string
): Promise<{id: number; name: string} | null> {
  const params = new URLSearchParams({name, level_type: type, page: '1'});
  try {
    const {value} = await HttpClient.fetchJson<{
      levels: {id: string; name: string}[];
    }>(`/levels/get_filtered_levels?${params}`);
    const match = (value.levels || []).find(l => l.name === name);
    return match ? {id: Number(match.id), name: match.name} : null;
  } catch {
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

// PATCH /levels/:id — write the student-facing markdown instructions into
// the level's long_instructions property. The levels controller's level_params
// allow-list pulls in any serialized_attrs from the level subclass via
// Level.permitted_params, which includes long_instructions.
export async function updateLongInstructions(
  levelId: number,
  longInstructions: string
): Promise<void> {
  const form = new FormData();
  form.append('level[long_instructions]', longInstructions);
  await HttpClient.put(`/levels/${levelId}`, form, true);
}

// PATCH /levels/:id — record the prompt the levelbuilder typed into the
// /generate page on the level itself, so reopening /generate later can
// pre-populate it. Stored in the level's generate_prompt serialized
// property.
export async function updateGeneratePrompt(
  levelId: number,
  prompt: string
): Promise<void> {
  const form = new FormData();
  form.append('level[generate_prompt]', prompt);
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
