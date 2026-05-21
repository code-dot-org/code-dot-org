import {LevelPropertiesMapValidator} from '@cdo/apps/lab2/responseValidators';
import {LevelPropertiesMap} from '@cdo/apps/lab2/types';
import HttpClient from '@cdo/apps/util/HttpClient';

// GET /lessons/:id/level_properties — fetch the camelCased properties
// bag for every level in this lesson, keyed by level id (as a string).
// Both the lesson generator (continuity context for the per-level AI
// calls) and the slides generator (lesson-content context for the
// slides outline AI) read this; lives in curriculum-generator/ so
// neither page reaches into the other for it.
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
