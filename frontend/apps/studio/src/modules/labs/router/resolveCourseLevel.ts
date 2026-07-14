import type {
  LevelPropertiesBase,
  LevelPropertiesMap,
  ScriptStructure,
} from '@code-dot-org/core/api';

/** Thrown when the requested course/lesson/level position has no match. */
export class CourseLevelNotFoundError extends Error {}

interface LevelEntry {
  position: number;
  levelId: number;
  scriptLevelId: string;
  path: string;
}

export interface ResolvedCourseLevel {
  levelId: number;
  scriptLevelId: string;
  position: number;
  totalLevels: number;
  scriptName: string;
  finishLink?: string;
  properties: LevelPropertiesBase;
  levels: LevelEntry[];
}

export function resolveCourseLevel(
  structure: ScriptStructure,
  levelPropertiesMap: LevelPropertiesMap,
  lessonPosition: number,
  levelPosition: number,
): ResolvedCourseLevel {
  const lesson = structure.lessons.find(l => l.position === lessonPosition);
  if (!lesson) {
    throw new CourseLevelNotFoundError(
      `Lesson not found at position ${lessonPosition} in "${structure.name}"`,
    );
  }

  const levels: LevelEntry[] = lesson.levels.map(l => ({
    position: l.position,
    levelId: parseInt(l.activeId, 10),
    scriptLevelId: l.id,
    path: l.path,
  }));

  const structureLevel = lesson.levels.find(l => l.position === levelPosition);
  if (!structureLevel) {
    throw new CourseLevelNotFoundError(
      `Level not found at position ${levelPosition} in lesson ${lessonPosition}`,
    );
  }

  const activeId = structureLevel.activeId;
  const properties = levelPropertiesMap[activeId];
  if (!properties) {
    throw new CourseLevelNotFoundError(
      `Level properties not found for level ${activeId} (position ${levelPosition})`,
    );
  }

  return {
    levelId: parseInt(activeId, 10),
    scriptLevelId: structureLevel.id,
    position: levelPosition,
    totalLevels: lesson.levels.length,
    scriptName: lesson.script_name,
    finishLink: lesson.finishLink,
    properties,
    levels,
  };
}
