import type {Lesson} from '../lessons';

/** Defines a lesson group in the raw, internal data */
export interface LessonGroupDefinition {
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

/** Describes a lesson group, which is a set of related lessons */
export interface LessonGroup {
  /** The unique key for this lesson group */
  key: string;
  /** The human-readable title for the lesson group */
  title: string;
  /** The position of this group within the unit as a whole */
  position: number;
  /** Whether or not this group is student facing */
  userFacing: boolean;
  /** The set of lessons for the lesson group */
  lessons: Lesson[];
}
