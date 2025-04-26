import fs from 'fs/promises';
import path from 'path';

interface LessonDefinition {
  seeding_key?: {
    ['lesson.key']?: string;
    ['lesson_group.key']?: string;
    ['script.name']?: string;
  };
}

interface LessonGroupDefinition {
  seeding_key?: {
    ['lesson_group.key']?: string;
    ['script.name']?: string;
  };
  properties: {
    display_name: string;
  };
  lessons: LessonDefinition[];
}

export interface UnitData {
  lesson_groups: LessonGroupDefinition[];
  lessons: LessonDefinition[];
}

export const loadUnit: (slug: string) => Promise<object> = async (
  slug: string,
) => {
  // File the .script_json file within the ./data path
  const filePath = path.join(
    process.cwd(),
    'data',
    'units',
    `${slug}.script_json`,
  );
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
};

export const parseUnitData = (data: object) => {
  // Determine the lesson groups, if any
  const lessonGroups = (data.lesson_groups || []).map(lessonGroup => {
    lessonGroup.lessons ||= (data.lessons || []).filter(
      lesson => lesson.seeding_key?.['lesson_group.key'] === lessonGroup.key,
    );
    return lessonGroup;
  });

  // Loose lessons
  const lessons = (data.lessons || []).filter(
    lesson => !lesson.seeding_key?.['lesson_group.key'],
  );

  // Put levels within lessons
  (data.lessons || []).forEach((lesson, i) => {
    // Record lesson index into the lesson data to back-reference it
    lesson.index = i + 1;
    lesson.levels ||= (data.levels_script_levels || [])
      .filter(
        levelScriptLevel =>
          levelScriptLevel.seeding_key?.['lesson.key'] === lesson.key,
      )
      .map(levelScriptLevel => ({
        ...levelScriptLevel,
        ...((data.script_levels || []).find(scriptLevel =>
          scriptLevel.seeding_key?.['script_level.level_keys'].includes(
            levelScriptLevel.seeding_key?.['level.key'],
          ),
        ) || {}),
      }));

    // Also patch together the Activity Sections (Progressions) for each lesson
    lesson.activitySections = [];
    let lastActivitySection = {};
    lesson.levels.forEach((level, i) => {
      const key = level.seeding_key?.['activity_section.key'];
      if (key !== lastActivitySection.key) {
        lastActivitySection = {
          from: i + 1,
          to: i + 1,
          ...(data.activity_sections.find(
            activitySection => activitySection.key === key,
          ) || {}),
        };
        lesson.activitySections.push(lastActivitySection);
      } else {
        // The following level is part of the same activity section
        lastActivitySection.to = i + 1;
      }
      level.activitySection = lastActivitySection;
    });
  });

  return {
    config: data,
    lessonGroups: lessonGroups,
    lessons: lessons,
  };
};
