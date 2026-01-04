/** Defines a teaching objective in internal unit data */
export interface ObjectiveDefinition {
  key: string;
  properties: {
    description: string;
  };
  seeding_key: {
    ['lesson.key']: string;
    ['objective.key']: string;
  };
}
