import HttpClient from '@cdo/apps/util/HttpClient';

import {SerializedLesson} from './types';

// Body shape accepted by ScriptsController#update_lesson_outlines. The
// server treats entries with `id` as updates of an existing Lesson and
// entries without `id` as new Lessons it should create. Order in the
// array becomes the lesson order in the unit.
export interface LessonOutlinePayload {
  id?: number;
  key: string;
  name: string;
  // Optional: when present, overwrites the lesson's generate_outline.
  // When absent, the server leaves the existing value alone — that's how
  // the page preserves outlines on lessons the user didn't touch.
  generateOutline?: string;
}

// PUT /s/:script_name/lesson_outlines (or the course-path equivalent).
// `editUnitUrl` is the page's edit-page URL (already passed in from the
// server); we swap the trailing /edit for /lesson_outlines, which sits
// at the same route family in unit_routes for both URL forms.
//
// `generateOutline` (when supplied) is persisted on the Unit so reloads
// of the /generate page restore the unit-level prompt. Pass undefined to
// leave the persisted value alone; pass '' to clear it.
export async function saveLessonOutlines(
  editUnitUrl: string,
  lessons: LessonOutlinePayload[],
  generateOutline?: string
): Promise<{lessons: SerializedLesson[]}> {
  const url = editUnitUrl.replace(/\/edit$/, '/lesson_outlines');
  const body: Record<string, unknown> = {lessons};
  if (generateOutline !== undefined) body.generateOutline = generateOutline;
  const response = await HttpClient.put(url, JSON.stringify(body), true, {
    'Content-Type': 'application/json;charset=UTF-8',
    Accept: 'application/json',
  });
  return await response.json();
}
