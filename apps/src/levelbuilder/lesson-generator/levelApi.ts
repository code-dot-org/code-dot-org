import {LabType, SerializedActivity} from './types';

const csrfToken = (): string => {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return (meta && meta.getAttribute('content')) || '';
};

const jsonHeaders = () => ({
  'Content-Type': 'application/json;charset=UTF-8',
  Accept: 'application/json',
  'X-CSRF-Token': csrfToken(),
});

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

  const response = await fetch('/levels?do_not_redirect=true', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({type, name, published: true}),
  });
  if (response.ok) {
    const created = await response.json();
    return {id: created.id, name: created.name, reused: false};
  }
  const body = await response.text();
  if (response.status === 406 && /name has already been taken/i.test(body)) {
    const racy = await findLevelByName(type, name);
    if (racy) return {...racy, reused: true};
  }
  throw new Error(
    `Failed to create level "${name}": ${response.status} ${body}`
  );
}

// GET /levels/get_filtered_levels — find a level of the given type with an
// exact name match. The endpoint does a LIKE %name% search, so we filter
// the results client-side for the exact name we asked for.
async function findLevelByName(
  type: LabType,
  name: string
): Promise<{id: number; name: string} | null> {
  const params = new URLSearchParams({name, level_type: type, page: '1'});
  const response = await fetch(`/levels/get_filtered_levels?${params}`, {
    headers: {Accept: 'application/json'},
  });
  if (!response.ok) return null;
  const data = (await response.json()) as {
    levels: {id: string; name: string}[];
  };
  const match = (data.levels || []).find(l => l.name === name);
  return match ? {id: Number(match.id), name: match.name} : null;
}

// PATCH /levels/:id — write panel data into a Panels level. We post as
// multipart/form-data to mirror the panels-edit form, since the levels
// controller expects level[panels] as a JSON string and runs it through
// handle_json_params.
export async function updatePanelsLevel(
  levelId: number,
  panels: object[]
): Promise<void> {
  const form = new FormData();
  form.append('level[panels]', JSON.stringify(panels));
  // Clear out any stale level_data so we don't keep an old "panels" array
  // hidden in there. EditPanels does the same on save.
  form.append('level[level_data]', JSON.stringify({}));
  const response = await fetch(`/levels/${levelId}`, {
    method: 'PATCH',
    headers: {'X-CSRF-Token': csrfToken()},
    body: form,
  });
  if (!response.ok) {
    throw new Error(
      `Failed to save panels: ${response.status} ${await response.text()}`
    );
  }
}

// POST /levels/:id/update_start_code — write start_sources into a Weblab2
// level. The controller forwards everything in the body to update_properties,
// so this is the same payload shape used by the codebridge save button.
export async function updateStartSources(
  levelId: number,
  startSources: object
): Promise<void> {
  const response = await fetch(`/levels/${levelId}/update_start_code`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({start_sources: startSources}),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to save start sources: ${
        response.status
      } ${await response.text()}`
    );
  }
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
  const response = await fetch(`/levels/${levelId}`, {
    method: 'PATCH',
    headers: {'X-CSRF-Token': csrfToken()},
    body: form,
  });
  if (!response.ok) {
    throw new Error(
      `Failed to save instructions: ${response.status} ${await response.text()}`
    );
  }
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
  const response = await fetch(`/levels/${levelId}`, {
    method: 'PATCH',
    headers: {'X-CSRF-Token': csrfToken()},
    body: form,
  });
  if (!response.ok) {
    throw new Error(
      `Failed to save generate prompt: ${
        response.status
      } ${await response.text()}`
    );
  }
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
  const response = await fetch('/level_assets/upload', {
    method: 'POST',
    headers: {'X-CSRF-Token': csrfToken()},
    body: form,
  });
  const result = await response.json();
  if (!response.ok || !result.newAssetUrl) {
    throw new Error(
      `Failed to upload asset: ${result?.message || response.status}`
    );
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
): Promise<Record<string, Record<string, unknown>>> {
  const response = await fetch(`/lessons/${lessonId}/level_properties`, {
    headers: {Accept: 'application/json'},
  });
  if (!response.ok) {
    throw new Error(
      `Failed to load level properties: ${
        response.status
      } ${await response.text()}`
    );
  }
  return await response.json();
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
  const response = await fetch(`/lessons/${lessonId}`, {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to save lesson activities: ${
        response.status
      } ${await response.text()}`
    );
  }
}
