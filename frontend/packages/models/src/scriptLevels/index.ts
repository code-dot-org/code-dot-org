/** Defines a script/level association in internal unit data */
export interface ScriptLevelDefinition {
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
