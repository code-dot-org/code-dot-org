import fs from 'fs/promises';
import path from 'path';
import YAML from 'yaml';

import type {ActivitySection} from '@code-dot-org/models/activitySections';
import {LessonLevel} from '@code-dot-org/models/lessonLevels';
import {LessonDefinition} from '@code-dot-org/models/lessons';
import {LevelKind} from '@code-dot-org/models/levels';
import type {Level} from '@code-dot-org/models/levels';
import type {ScriptLevelDefinition} from '@code-dot-org/models/scriptLevels';
import type {Unit, UnitDefinition} from '@code-dot-org/models/units';

import {loadLevel} from './level';

export interface UnitLoadInfo {
  path: string;
  data: UnitDefinition;
}

/**
 * Loads the raw course data from a 'script_json' file.
 *
 * It may cache the result in its normalized form, and on subsequent calls it
 * will load from that file instead.
 */
export const loadUnitDefinition: (
  slug: string,
) => Promise<UnitLoadInfo> = async (slug: string) => {
  console.log('load unit def');
  // File the .script_json file within the ./data path and fallback to the
  // dashboard/config/... path
  const filePath = path.join(
    process.cwd(),
    'data',
    'units',
    `${slug}.script_json`,
  );

  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return {
      path: filePath,
      data: JSON.parse(fileContents),
    };
  } catch (_) {
    // Could not find the file in the ./data path
  }

  const fallbackPath = path.join(
    process.cwd(),
    '..',
    '..',
    '..',
    'dashboard',
    'config',
    'scripts_json',
    `${slug}.script_json`,
  );

  console.log(fallbackPath);

  const fallbackContents = await fs.readFile(fallbackPath, 'utf8');
  const ret = JSON.parse(fallbackContents);

  // Add locale information
  const localePath = path.join(
    process.cwd(),
    '..',
    '..',
    '..',
    'dashboard',
    'config',
    'locales',
    'courses',
    'en.yml',
  );
  const localeContents = await fs.readFile(localePath, 'utf8');
  const localeData = YAML.parse(localeContents);

  const altLocalePath = path.join(
    process.cwd(),
    '..',
    '..',
    '..',
    'dashboard',
    'config',
    'locales',
    'scripts',
    'en.yml',
  );
  const altLocaleContents = await fs.readFile(altLocalePath, 'utf8');
  const altLocaleData = YAML.parse(altLocaleContents);

  ret.locale_data =
    localeData?.en?.data?.course?.name?.[slug] ||
    altLocaleData?.en?.data?.script?.name?.[slug] ||
    {};

  ret.locale_data.description_student ||= ret.locale_data.student_description;
  ret.locale_data.description_teacher ||= ret.locale_data.teacher_description;

  return {
    path: fallbackPath,
    data: ret,
  };
};

/**
 * Parse the raw unit data.
 */
export const parseUnitData: (
  data: UnitDefinition,
  unitPath?: string,
) => Promise<Unit> = async (data: UnitDefinition, unitPath?: string) => {
  const ret: Unit = {
    key: data.script.name,
    title: data.locale_data?.title || 'Unknown',
    path: unitPath,
    version: data.locale_data?.version_title || '',
    serializedAt: data.script.serialized_at,
    publishedState: data.script.published_state,
    instructionType: data.script.instruction_type,
    instructorAudience: data.script.instructor_audience,
    description: {
      short: data.locale_data?.description_short || '',
      student: data.locale_data?.description_student || '',
      teacher: data.locale_data?.description_teacher || '',
    },
    properties: {
      loginRequired: data.script.login_required,
      contentArea: data.script.properties.content_area,
      curriculumUmbrella: data.script.properties.curriculum_umbrella,
      hideableLessons: data.script.properties.hideable_lessons,
      isMigrated: data.script.properties.is_migrated,
      lessonExtrasAvailable: data.script.properties.lesson_extras_available,
      projectWidgetTypes: data.script.properties.project_widget_types,
      projectWidgetVisible: data.script.properties.project_widget_visible,
      showCalendar: data.script.properties.show_calendar,
      tts: data.script.properties.tts,
      weeklyInstructionalMinutes:
        data.script.properties.weekly_instructional_minutes,
    },
    lessonGroups: [],
    lessons: [],
  };

  // Get optional fields
  if (data.script.new_name) {
    ret.newName = data.script.new_name;
  }
  if (data.script.family_name) {
    ret.familyName = data.script.family_name;
  }

  ret.lessons = (data.lessons || []).map((lesson, i) => ({
    key: lesson.key,
    title: lesson.name,
    lockable: lesson.lockable,
    hidden: false,
    numberedLesson: true,
    hasLessonPlan: lesson.has_lesson_plan,
    absolutePosition: lesson.absolute_position,
    relativePosition: lesson.relative_position,
    index: i,
    activitySections: [],
    levels: (data.levels_script_levels || [])
      .filter(
        levelScriptLevel =>
          levelScriptLevel.seeding_key?.['lesson.key'] === lesson.key,
      )
      .map(levelScriptLevel => {
        const scriptLevel: ScriptLevelDefinition = (
          data.script_levels || []
        ).find(scriptLevel =>
          scriptLevel.seeding_key?.['script_level.level_keys'].includes(
            levelScriptLevel.seeding_key?.['level.key'],
          ),
        ) || {
          // Some empty script level description
          chapter: 0,
          position: 0,
          activity_section_position: 0,
          assessment: false,
          bonus: false,
          level_keys: [],
          properties: {
            level_keys: [],
            progression: '',
          },
          seeding_key: {
            ['script_level.level_keys']: [],
            ['lesson.key']: '',
            ['lesson_group.key']: '',
            ['script.name']: '',
            ['activity_section.key']: '',
          },
        };

        return {
          chapter: scriptLevel.chapter,
          position: scriptLevel.position,
          activitySectionPosition: scriptLevel.activity_section_position,
          activitySectionIndex: -1,
          assessment: scriptLevel.assessment,
          bonus: scriptLevel.bonus,
          levelKeys: scriptLevel.level_keys,
          progression: scriptLevel.properties.progression,
        };
      }),
    properties: {
      license: lesson.properties.creative_commons_license,
      overview: lesson.properties.overview,
      preparation: lesson.properties.preparation,
      purpose: lesson.properties.purpose,
      studentOverview: lesson.properties.student_overview,
    },
  }));

  ret.lessons.forEach(lesson => {
    // Patch together the Activity Sections (Progressions) for each lesson
    let lastActivitySection: ActivitySection = {
      key: '',
      title: '',
      position: -1,
      description: '',
      from: -1,
      to: -1,
    };

    let lessonLevelIndex = -1;
    (data.script_levels || []).forEach(level => {
      if (level.seeding_key?.['lesson.key'] === lesson.key) {
        lessonLevelIndex++;
        const key = level.seeding_key?.['activity_section.key'];
        if (key !== lastActivitySection.key) {
          const activitySectionDefinition = data.activity_sections.find(
            activitySection => activitySection.key === key,
          );

          if (activitySectionDefinition) {
            lastActivitySection = {
              from: lessonLevelIndex + 1,
              to: lessonLevelIndex + 1,
              key: activitySectionDefinition.key,
              position: activitySectionDefinition.position,
              description: activitySectionDefinition.properties.description,
              title:
                activitySectionDefinition.properties.name ||
                activitySectionDefinition.properties.progression_name ||
                '',
            };

            lesson.levels[lessonLevelIndex].activitySectionIndex =
              lesson.activitySections.length;
            lesson.activitySections.push(lastActivitySection);
          }
        } else {
          // The following level is part of the same activity section
          lastActivitySection.to = lessonLevelIndex + 1;
          lesson.levels[lessonLevelIndex].activitySectionIndex =
            lesson.activitySections.length - 1;
        }
      }
    });
  });

  // Determine the lesson groups, if any
  ret.lessonGroups = (data.lesson_groups || [])
    .filter(lessonGroup => lessonGroup.key !== '')
    .map((lessonGroup, i) => ({
      key: lessonGroup.key,
      title: lessonGroup.properties.display_name,
      position: lessonGroup.position,
      userFacing: lessonGroup.user_facing,
      lessons: (
        data.lessons.map((lesson, j) => [lesson, j]) as [
          LessonDefinition,
          number,
        ][]
      )
        .filter(
          ([lesson, _]) =>
            lesson.seeding_key?.['lesson_group.key'] === lessonGroup.key,
        )
        .map(([_, j]) => {
          ret.lessons[j].lessonGroupIndex = i;
          return ret.lessons[j];
        }),
    }));

  // Load all level datas asynchronously
  const levelLoader: (level: LessonLevel) => Promise<void> = async (
    level: LessonLevel,
  ) => {
    if (level.levelKeys.length === 0) {
      return;
    }

    const key = level.levelKeys[0];
    let levelData: Level | undefined;
    try {
      levelData = await loadLevel(key);
    } catch (_) {
      console.log('LEVEL LOAD ERROR', key);
      throw _;
    }
    console.log('LEVEL', levelData);
    level.data = {
      key: levelData?.key || key,
      url: '',
      kind: LevelKind.activity,
      type: levelData?.type || 'Unknown',
      isConcept: levelData?.isConcept || false,
    };
  };
  const levelLoadPromises = ([] as LessonLevel[])
    .concat(...ret.lessons.map(lesson => lesson.levels))
    .map(level => levelLoader(level));

  await Promise.all(levelLoadPromises);

  console.log('UNIT', ret);

  return ret;
};

export const loadUnit: (slug: string) => Promise<Unit> = async (
  slug: string,
) => {
  // Look for a normalized file already there.
  const cachePath = path.join(process.cwd(), 'cache', 'units', `${slug}.json`);

  try {
    const fileContents = await fs.readFile(cachePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (_) {
    // Could not find the file in the ./data path
  }

  // Try to load the unit from unit definitions
  const {path: unitPath, data: unit} = await loadUnitDefinition(slug);
  const ret: Unit = await parseUnitData(unit, unitPath);

  // Preserve the cached data
  await fs.writeFile(cachePath, JSON.stringify(ret), 'utf8');

  // Return the unit data
  return ret;
};

export type {Unit};
