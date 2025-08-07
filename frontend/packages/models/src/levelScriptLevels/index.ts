/** Defines a level/script-level association in internal unit data */
export interface LevelScriptLevelDefinition {
  seeding_key: {
    ['level.key']: string;
    ['script_level.level_keys']: string[];
    ['lesson.key']: string;
    ['lesson_group.key']: string;
    ['script.name']: string;
    ['activity_section.key']: string;
  };
}
