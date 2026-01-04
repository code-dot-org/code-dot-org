import {Level} from '@api/models/levels';

/** Describes a reference to a level within a lesson. */
export interface LessonLevel {
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
  data?: Level;
}
