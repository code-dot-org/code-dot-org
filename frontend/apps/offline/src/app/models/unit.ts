import fs from 'fs/promises';
import path from 'path';
import YAML from 'yaml';

import {loadLevel, LevelData} from './level';

/** Defines a lesson in the raw, internal data */
interface LessonDefinition {
  key: string;
  name: string;
  lockable: boolean;
  has_lesson_plan: boolean;
  absolute_position: number;
  relative_position: number;
  properties: {
    creative_commons_license: 'Creative Commons BY-NC-SA' | string;
    overview: string;
    preparation: string;
    purpose: string;
    student_overview: string;
  };
  seeding_key?: {
    ['lesson.key']?: string;
    ['lesson_group.key']?: string;
    ['script.name']?: string;
  };
}

/** Defines a lesson group in the raw, internal data */
interface LessonGroupDefinition {
  key: string;
  user_facing: boolean;
  position: number;
  properties: {
    display_name: string;
  };
  seeding_key: {
    ['lesson_group.key']: string;
    ['script.name']: string;
  };
}

/** Defines a lesson activity in the internal unit data */
interface LessonActivityDefinition {
  key: string;
  position: number;
  properties: {
    duration: number;
    name: string;
  };
  seeding_key: {
    ['lesson_activity.key']: string;
    ['lesson.key']: string;
    ['lesson_group.key']: string;
    ['script.name']: string;
  };
}

/** Defines an activity section in internal unit data */
interface ActivitySectionDefinition {
  key: string;
  position: number;
  properties: {
    description: string;
    name?: string;
    progression_name?: string;
  };
  seeding_key: {
    ['activity_section.key']: string;
    ['lesson_activity.key']: string;
  };
}

/** Defines a script/level association in internal unit data */
interface ScriptLevelDefinition {
  chapter: number;
  position: number;
  activity_section_position: number;
  assessment: boolean;
  bonus: boolean;
  level_keys: string[];
  properties: {
    level_keys: string[];
    progression: string;
  };
  seeding_key: {
    ['script_level.level_keys']: string[];
    ['lesson.key']: string;
    ['lesson_group.key']: string;
    ['script.name']: string;
    ['activity_section.key']: string;
  };
}

/** Defines a level/script-level association in internal unit data */
interface LevelScriptLevelDefinition {
  seeding_key: {
    ['level.key']: string;
    ['script_level.level_keys']: string[];
    ['lesson.key']: string;
    ['lesson_group.key']: string;
    ['script.name']: string;
    ['activity_section.key']: string;
  };
}

/** Defines a resource in internal unit data */
interface ResourceDefinition {
  name: string;
  url: string;
  key: string;
  properties: {
    is_rollup?: boolean;
    audience?: 'Student' | 'Teacher' | 'Verified Teacher';
    type?: string;
    include_in_pdf?: boolean;
    download_url?: string;
  };
  seeding_key: {
    ['resource.key']: string;
  };
}

/** Defines a lesson resource in internal unit data */
interface LessonsResourceDefinition {
  seeding_key: {
    ['lesson.key']: string;
    ['resource.key']: string;
  };
}

/** Defines a script (unit) resource in internal unit data */
interface ScriptsResourceDefinition {
  seeding_key: {
    ['script.name']: string;
    ['resource.key']: string;
  };
}

/** Defines a vocabulary definition in internal unit data */
interface VocabularyDefinition {
  key: string;
  word: string;
  definition: string;
  seeding_key: {
    ['vocabulary.key']: string;
  };
}

/** Defines a lesson vocabulary definition in internal unit data */
interface LessonsVocabularyDefinition {
  seeding_key: {
    ['lesson.key']: string;
    ['vocabulary.key']: string;
  };
}

/** Defines a lesson programming expression in internal unit data */
interface LessonsProgrammingExpressionDefinition {
  seeding_key: {
    ['lesson.key']: string;
    ['programming_environment.name']: string;
    ['programming_expression.key']: string;
  };
}

/** Defines a teaching objective in internal unit data */
interface ObjectiveDefinition {
  key: string;
  properties: {
    description: string;
  };
  seeding_key: {
    ['lesson.key']: string;
    ['objective.key']: string;
  };
}

/** Defines a education standard in internal unit data */
interface LessonsStandardDefinition {
  seeding_key: {
    ['lesson.key']: string;
    ['framework.shortcode']: string;
    ['standard.shortcode']: string;
  };
}

/** Defines a opportunity standard in internal unit data */
interface LessonsOpportunityStandardDefinition {
  seeding_key: {
    ['lesson.key']: string;
    ['framework.shortcode']: string;
    ['opportunity_standard.shortcode']: string;
  };
}

/** Defines a rubric association in internal unit data */
interface RubricDefinition {
  level_name: string;
  seeding_key: {
    ['lesson.key']: string;
    ['lesson_group.key']: string;
    ['script.name']: string;
  };
}

/** Defines a rubric entry (learning goal) in internal unit data */
interface LearningGoalDefinition {
  key: string;
  position: number;
  learning_goal: string;
  ai_enabled: boolean;
  tips: string | null;
  seeding_key: {
    ['learning_goal.key']: string;
    ['lesson.key']: string;
    ['lesson_group.key']: string;
    ['script.name']: string;
  };
}

/** Defines a rubric entry (learning goal) assessment criteria in internal unit data */
interface LearningGoalEvidenceLevelDefinition {
  understanding: number;
  teacher_description: string;
  ai_prompt: string;
  seeding_key: {
    understanding: number;
    ['learning_goal.key']: string;
    ['lesson.key']: string;
    ['lesson_group.key']: string;
    ['script.name']: string;
  };
}

/** Describes a unit in the raw, internal data */
interface UnitDefinition {
  locale_data?: {
    title: string;
    description_short: string;
    description_student: string;
    description_teacher: string;
    version_title: string;
  };
  script: {
    name: string;
    wrapup_video_id: string | null;
    login_required: boolean;
    properties: {
      content_area: string;
      curriculum_umbrella: string;
      has_lesson_plan: boolean;
      hideable_lessons: boolean;
      is_migrated: boolean;
      lesson_extras_available: boolean;
      project_widget_types: string[];
      project_widget_visible: boolean;
      show_calendar: boolean;
      tts: boolean;
      weekly_instructional_minutes: number;
    };
    new_name: string | null;
    family_name: string | null;
    serialized_at: string;
    published_state: 'in_development' | 'deprecated' | 'beta' | null;
    instruction_type: 'teacher_led' | 'self_paced' | null;
    instructor_audience:
      | 'teacher'
      | 'plc_reviewer'
      | 'facilitator'
      | 'universal_instructor'
      | null;
    seeding_key: {
      ['script.name']: string;
    };
  };
  lesson_groups: LessonGroupDefinition[];
  lessons: LessonDefinition[];
  lesson_activities: LessonActivityDefinition[];
  activity_sections: ActivitySectionDefinition[];
  script_levels: ScriptLevelDefinition[];
  levels_script_levels: LevelScriptLevelDefinition[];
  resources: ResourceDefinition[];
  lessons_resources: LessonsResourceDefinition[];
  scripts_resources: ScriptsResourceDefinition[];
  scripts_student_resources: [];
  vocabularies: VocabularyDefinition[];
  lessons_vocabularies: LessonsVocabularyDefinition[];
  lessons_programming_expressions: LessonsProgrammingExpressionDefinition[];
  objectives: ObjectiveDefinition[];
  lessons_standards: LessonsStandardDefinition[];
  lessons_opportunity_standards: LessonsOpportunityStandardDefinition[];
  rubrics: RubricDefinition[];
  learning_goals: LearningGoalDefinition[];
  learning_goal_evidence_levels: LearningGoalEvidenceLevelDefinition[];
}

/** Describes an activity section, which is a group of levels within a lesson */
export interface ActivitySectionData {
  /** The unique key that will identify this activity section. */
  key: string;
  /** The human-readable title for this activity section */
  title: string;
  /** The position of this activity section within the lesson */
  position: number;
  /** The markdown description for this activity section */
  description: string;
  /** The inclusive starting level index for this activity section */
  from: number;
  /** The inclusive ending level index for this activity section */
  to: number;
}

/** Describes a reference to a level within a lesson. */
export interface LessonLevelData {
  /** The chapter number for this lesson level. */
  chapter: number;
  /** The position of this level within the lesson. */
  position: number;
  /** The position of this level within the activity section */
  activitySectionPosition: number;
  /**
   * The index for the activity section this level belongs to withi
   * the lesson's activitySection array.
   */
  activitySectionIndex: number;
  /** Whether or not this is an assessment level (graded by instructor) */
  assessment: boolean;
  /** Whether or not this is a bonus or challenge level. */
  bonus: boolean;
  /** The level keys that point to level data for this lesson level. */
  levelKeys: string[];
  /**
   * The name of the progression this level belongs to.
   *
   * The activity section is the better source of truth for this.
   */
  progression: string;
  /** The realized level data, when known. */
  data?: LevelData;
}

/** Describes a lesson */
export interface LessonData {
  /** The unique key for this lesson */
  key: string;
  /** The human-readable title for this lesson */
  title: string;
  /** Whether or not this lesson can be locked */
  lockable: boolean;
  /** Whether or not this lesson has an associated lesson plan */
  hasLessonPlan: boolean;
  /** The position of this lesson within the unit as a whole */
  absolutePosition: number;
  /** The position of this lesson within the lesson group */
  relativePosition: number;
  /** The index of the lesson in the Unit's lesson array. */
  index: number;
  /** The index of the lesson group in the Unit's lessonGroup array this lesson belongs to */
  lessonGroupIndex?: number;
  /** Other properties that are useful metadata for the lesson */
  properties: {
    /** The content license for this lesson, typically a Creative Commons license */
    license: string;
    /** An overview description for this lesson targetting educators. */
    overview: string;
    /** A description of the preparation expected for educations with respect to this lesson */
    preparation: string;
    /** A description of the intent of the lesson for educators */
    purpose: string;
    /** A description that serves as an overview for students */
    studentOverview: string;
  };
  /** The activity sections within this lesson, which contain levels. */
  activitySections: ActivitySectionData[];
  /** The levels within the lesson. */
  levels: LessonLevelData[];
}

/** Describes a lesson group, which is a set of related lessons */
export interface LessonGroupData {
  /** The unique key for this lesson group */
  key: string;
  /** The human-readable title for the lesson group */
  title: string;
  /** The position of this group within the unit as a whole */
  position: number;
  /** Whether or not this group is student facing */
  userFacing: boolean;
  /** The set of lessons for the lesson group */
  lessons: LessonData[];
}

/** Describes a course (unit) */
export interface UnitData {
  /** The unique key for the unit */
  key: string;
  /** The human-readable title of the course/unit */
  title: string;
  /** The local path for the unit data */
  path?: string;
  /** The version identifier */
  version: string;
  /** The updated name for the unit (a rare field) */
  newName?: string;
  /** The course family this unit belongs to, if any */
  familyName?: string;
  /** The time this course was last written */
  serializedAt: string;
  /** The development state of this unit */
  publishedState: 'in_development' | 'deprecated' | 'beta' | null;
  /** The expected instruction style this course expects */
  instructionType: 'teacher_led' | 'self_paced' | null;
  /** The expected type of instructor for this course */
  instructorAudience:
    | 'teacher'
    | 'plc_reviewer'
    | 'facilitator'
    | 'universal_instructor'
    | null;
  /** Description metadata that introduces the course to different audiences */
  description: {
    /** A general description for the unit. */
    short: string;
    /** A student description for the unit. */
    student: string;
    /** A teacher description for the unit. */
    teacher: string;
  };
  /** Other unit metadata */
  properties: {
    /** Whether or not you are required to be logged in to access the course */
    loginRequired: boolean;
    /** The type of content this unit focuses on */
    contentArea: string;
    /** The curriculum this unit centers upon */
    curriculumUmbrella: string;
    /** Whether or not lessons in this unit are hideable */
    hideableLessons: boolean;
    /** Whether or not this unit was migrated */
    isMigrated: boolean;
    /** Whether or not there are extra levels */
    lessonExtrasAvailable: boolean;
    /** The types of widgets this unit makes use of */
    projectWidgetTypes: string[];
    projectWidgetVisible: boolean;
    showCalendar: boolean;
    /** Whether or not pre-generated text-to-speech is available */
    tts: boolean;
    /** The expected amount of time per week for instruction */
    weeklyInstructionalMinutes: number;
  };
  /** The lesson groups within the unit */
  lessonGroups: LessonGroupData[];
  /** The lessons within the unit that are not otherwise within lesson groups */
  lessons: LessonData[];
}

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
) => Promise<UnitData> = async (data: UnitDefinition, unitPath?: string) => {
  const ret: UnitData = {
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
    let lastActivitySection: ActivitySectionData = {
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
  const levelLoader: (level: LessonLevelData) => Promise<void> = async (
    level: LessonLevelData,
  ) => {
    if (level.levelKeys.length === 0) {
      return;
    }

    const key = level.levelKeys[0];
    let levelData: LevelData | undefined;
    try {
      levelData = await loadLevel(key);
    } catch (_) {
      console.log('LEVEL LOAD ERROR', key);
      throw _;
    }
    console.log('LEVEL', levelData);
    level.data = {
      key: levelData?.key || key,
      type: levelData?.type || 'Unknown',
      isConcept: levelData?.isConcept || false,
    };
  };
  const levelLoadPromises = ([] as LessonLevelData[])
    .concat(...ret.lessons.map(lesson => lesson.levels))
    .map(level => levelLoader(level));

  await Promise.all(levelLoadPromises);

  console.log('UNIT', ret);

  return ret;
};

export const loadUnit: (slug: string) => Promise<UnitData> = async (
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
  const ret: UnitData = await parseUnitData(unit, unitPath);

  // Preserve the cached data
  await fs.writeFile(cachePath, JSON.stringify(ret), 'utf8');

  // Return the unit data
  return ret;
};
