/** Defines a rubric association in internal unit data */
export interface RubricDefinition {
  level_name: string;
  seeding_key: {
    ['lesson.key']: string;
    ['lesson_group.key']: string;
    ['script.name']: string;
  };
}
