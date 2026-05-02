import {LabType, SerializedActivity, SerializedScriptLevel} from './types';

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

// POST /levels — create a level of the given type with the given name. We
// pass `do_not_redirect=true` so the controller returns the created Level
// record as JSON instead of a redirect URL.
//
// If the level name is already taken (Rails uniqueness validation), we
// look up the existing level by name and return it with reused=true so
// the caller can overwrite its content. This matches what a levelbuilder
// would do by hand — go open the existing level and edit it.
export async function createOrFindLevel(
  type: LabType,
  name: string
): Promise<CreatedLevel> {
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
    const existing = await findLevelByName(type, name);
    if (existing) return {...existing, reused: true};
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

// PATCH /lessons/:id — append the given (already-created) levels into the
// last activity section of the lesson, preserving everything else. We
// re-send the existing activities verbatim (with display fields renamed
// where the lesson update endpoint expects different names).
export async function attachLevelsToLesson(
  lessonId: number,
  activities: SerializedActivity[],
  newScriptLevels: SerializedScriptLevel[]
): Promise<void> {
  const updated = appendLevelsToLastSection(activities, newScriptLevels);
  const response = await fetch(`/lessons/${lessonId}`, {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify({
      activities: JSON.stringify(updated),
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to attach levels to lesson: ${
        response.status
      } ${await response.text()}`
    );
  }
}

// Append new script levels to the last activity section of the given
// activities, returning a fresh array suitable for posting to the lesson
// update endpoint. Mirrors the shape produced by getSerializedActivities
// in activitiesEditorRedux.js. If the lesson has no activity or no section
// yet, a placeholder of each is synthesized — the server's fetch_activity
// and fetch_activity_section helpers turn id-less entries into freshly
// created records, so we don't need to call the lesson edit page first.
function appendLevelsToLastSection(
  activities: SerializedActivity[],
  newScriptLevels: SerializedScriptLevel[]
): SerializedActivity[] {
  const cloned: SerializedActivity[] = JSON.parse(JSON.stringify(activities));

  if (cloned.length === 0) {
    cloned.push(blankActivity(1));
  }

  const lastActivity = cloned[cloned.length - 1];
  lastActivity.activitySections = lastActivity.activitySections || [];
  if (lastActivity.activitySections.length === 0) {
    lastActivity.activitySections.push(blankSection(1));
  }
  const lastSection =
    lastActivity.activitySections[lastActivity.activitySections.length - 1];
  lastSection.scriptLevels = lastSection.scriptLevels || [];

  let nextPosition = lastSection.scriptLevels.length + 1;
  for (const sl of newScriptLevels) {
    lastSection.scriptLevels.push({
      ...sl,
      activitySectionPosition: nextPosition++,
    });
  }

  return cloned;
}

function blankActivity(position: number): SerializedActivity {
  return {
    position,
    name: '',
    duration: 0,
    activitySections: [blankSection(1)],
  };
}

function blankSection(position: number) {
  return {
    position,
    name: '',
    description: '',
    duration: 0,
    remarks: '',
    progressionName: '',
    tips: [],
    scriptLevels: [],
  };
}
