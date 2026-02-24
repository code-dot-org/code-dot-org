export interface SkillsByConcept {
  [key: string]: Array<Skill>;
}
export interface SkillIdentifier {
  id: number;
  key: string;
}
export interface Skill extends SkillIdentifier {
  concept: string;
  description: string;
  evaluationCriteria: string;
  hasLevels?: boolean;
}
export interface Levels {
  levelId: number;
  levelName: string;
  unitNames: string[];
  skills: SkillIdentifier[];
}
export interface LevelSkill {
  skillId: number;
  levelId: number;
}
