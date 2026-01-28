import type {ActivitySectionDefinition} from '../activitySections';
import type {LearningGoalEvidenceLevelDefinition} from '../learningGoalEvidenceLevels';
import type {LearningGoalDefinition} from '../learningGoals';
import type {LessonActivityDefinition} from '../lessonActivities';
import type {LessonGroupDefinition, LessonGroup} from '../lessonGroups';
import type {LessonDefinition, Lesson} from '../lessons';
import type {LessonsOpportunityStandardDefinition} from '../lessonsOpportunityStandards';
import type {LessonsProgrammingExpressionDefinition} from '../lessonsProgrammingExpressions';
import type {LessonsResourceDefinition} from '../lessonsResources';
import type {LessonsStandardDefinition} from '../lessonsStandards';
import type {LessonsVocabularyDefinition} from '../lessonsVocabularies';
import type {LevelScriptLevelDefinition} from '../levelScriptLevels';
import type {ObjectiveDefinition} from '../objectives';
import type {ResourceDefinition} from '../resources';
import type {RubricDefinition} from '../rubrics';
import type {ScriptLevelDefinition} from '../scriptLevels';
import type {ScriptsResourceDefinition} from '../scriptsResources';
import type {VocabularyDefinition} from '../vocabularies';

/** Describes a unit in the raw, internal data */
export interface UnitDefinition {
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

/** Describes a course (unit) */
export interface Unit {
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
  lessonGroups: LessonGroup[];
  /** The lessons within the unit that are not otherwise within lesson groups */
  lessons: Lesson[];
}
