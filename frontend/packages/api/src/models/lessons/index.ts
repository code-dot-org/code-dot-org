import type {ActivitySection} from '../activitySections';
import type {LessonLevel} from '../lessonLevels';

/** Defines a lesson in the raw, internal data */
export interface LessonDefinition {
  id?: number;
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

/** Describes a lesson */
export interface Lesson {
  /** The unique incremental id for the lesson */
  id?: number;
  /** The unique key for this lesson */
  key: string;
  /** The human-readable title for this lesson */
  title: string;
  /** Whether or not this lesson can be locked */
  lockable: boolean;
  /** Whether or not this lesson is hidden */
  hidden: boolean;
  /** Whether or not this lesson has an associated lesson plan */
  hasLessonPlan: boolean;
  /** The position of this lesson within the unit as a whole */
  absolutePosition: number;
  /** The position of this lesson within the lesson group */
  relativePosition: number;
  /** Whether or not this lesson is visually numbered */
  numberedLesson: boolean;
  /** The visual numbering for the numbered lesson */
  lessonNumber?: number;
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
  activitySections: ActivitySection[];
  /** The levels within the lesson. */
  levels: LessonLevel[];
}
