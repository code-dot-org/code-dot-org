// Projects a dashboard/config/scripts_json/<script>.script_json file (a
// Rails seed dump — verified against dashboard/config/scripts_json/
// k5-ai-data-2024.script_json) down to the fields buildCourse needs.

export interface ParsedScriptLesson {
  key: string;
  name: string;
  position: number;
  overview?: string;
}

export interface ParsedScriptLevel {
  lessonKey: string;
  levelKeys: string[];
  position: number;
  progression?: string;
}

export interface ParsedScriptJson {
  script: {name: string};
  lessons: ParsedScriptLesson[];
  scriptLevels: ParsedScriptLevel[];
}

interface RawScriptJson {
  script: {name: string};
  lessons: RawLesson[];
  script_levels: RawScriptLevel[];
}

interface RawLesson {
  key: string;
  name: string;
  absolute_position: number;
  properties?: {overview?: string; student_overview?: string};
}

interface RawScriptLevel {
  position: number;
  level_keys: string[];
  seeding_key: {'lesson.key': string};
  properties?: {progression?: string};
}

export function parseScriptJson(json: string): ParsedScriptJson {
  const raw = JSON.parse(json) as RawScriptJson;

  const lessons: ParsedScriptLesson[] = raw.lessons.map(lesson => ({
    key: lesson.key,
    name: lesson.name,
    position: lesson.absolute_position,
    // This course serializes `overview`; older scripts serialize
    // `student_overview` instead — prefer the newer field when both exist.
    overview:
      lesson.properties?.student_overview ?? lesson.properties?.overview,
  }));

  const scriptLevels: ParsedScriptLevel[] = raw.script_levels.map(sl => ({
    lessonKey: sl.seeding_key['lesson.key'],
    levelKeys: sl.level_keys,
    position: sl.position,
    progression: sl.properties?.progression,
  }));

  return {script: {name: raw.script.name}, lessons, scriptLevels};
}
