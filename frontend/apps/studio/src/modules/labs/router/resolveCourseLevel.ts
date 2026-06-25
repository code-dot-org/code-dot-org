import type {
  CourseLevelPropertiesMap,
  ScriptStructure,
} from '@code-dot-org/core/api';

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
  properties: Record<string, unknown>;
  levels: LevelEntry[];
}

export function resolveCourseLevel(
  structure: ScriptStructure,
  levelPropertiesMap: CourseLevelPropertiesMap,
  lessonPosition: number,
  levelPosition: number,
): ResolvedCourseLevel {
  const lesson = structure.lessons.find(
    l => (l as {position?: number}).position === lessonPosition,
  );
  if (!lesson) {
    throw new Error(
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
    throw new Error(
      `Level not found at position ${levelPosition} in lesson ${lessonPosition}`,
    );
  }

  const activeId = structureLevel.activeId;
  const properties = levelPropertiesMap[activeId];
  if (!properties) {
    throw new Error(
      `Level properties not found for level ${activeId} (position ${levelPosition})`,
    );
  }

  return {
    levelId: parseInt(activeId, 10),
    scriptLevelId: structureLevel.id,
    position: levelPosition,
    totalLevels: lesson.levels.length,
    scriptName: lesson.script_name,
    finishLink: (lesson as {finishLink?: string}).finishLink,
    properties,
    levels,
  };
}
