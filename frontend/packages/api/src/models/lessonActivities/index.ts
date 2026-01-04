/** Defines a lesson activity in the internal unit data */
export interface LessonActivityDefinition {
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
