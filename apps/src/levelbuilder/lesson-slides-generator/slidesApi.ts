import {Panel} from '@cdo/apps/panels/types';
import HttpClient from '@cdo/apps/util/HttpClient';

import {PersistedSlide} from './types';

// PUT /lessons/:id/slides_data — overwrite the per-lesson slides.json
// and (optionally) update the unit-level outline prompt on the Lesson.
//
// `slides` always replaces the file's array wholesale: the page tracks
// the canonical ordered list in React state and re-sends it on each save.
// `generateSlidesOutline` is optional: when omitted, the persisted
// Lesson.generate_slides_outline is left alone.
export async function saveSlidesData(
  lessonId: number,
  slides: PersistedSlide[],
  generateSlidesOutline?: string
): Promise<void> {
  const body: Record<string, unknown> = {slides};
  if (generateSlidesOutline !== undefined) {
    body.generateSlidesOutline = generateSlidesOutline;
  }
  await HttpClient.put(
    `/lessons/${lessonId}/slides_data`,
    JSON.stringify(body),
    true,
    {
      'Content-Type': 'application/json;charset=UTF-8',
      Accept: 'application/json',
    }
  );
}

// Save just the panels — used by the /slides/edit page after the user
// edits panels in EditPanels. We round-trip through saveSlidesData but
// preserve any descriptions already in the file so that the
// /slides/generate page still shows them when the user goes back. The
// caller passes the existing slides list (descriptions and all) plus an
// updated panels array; we zip them back together by index, since
// EditPanels doesn't know about descriptions.
export async function saveEditedPanels(
  lessonId: number,
  existingSlides: PersistedSlide[],
  panels: Panel[]
): Promise<void> {
  // Pair each panel back to its slide. EditPanels can add, remove, and
  // reorder panels; we match by key when the panel still has a
  // recognized one and otherwise fall back to "new slide, blank
  // description". Slides whose panel was removed get dropped.
  const byKey = new Map(existingSlides.map(s => [s.key, s]));
  const next: PersistedSlide[] = panels.map(panel => {
    const matched = byKey.get(panel.key);
    if (matched) return {...matched, panel};
    // Brand-new panel inserted via the editor; we have no description
    // for it. Leave the field blank so the /slides/generate page can
    // round-trip without losing data.
    return {key: panel.key, description: '', panel};
  });
  await saveSlidesData(lessonId, next);
}
