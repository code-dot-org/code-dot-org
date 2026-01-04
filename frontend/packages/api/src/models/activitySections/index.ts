/** Defines an activity section in internal unit data */
export interface ActivitySectionDefinition {
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

/** Describes an activity section, which is a group of levels within a lesson */
export interface ActivitySection {
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
