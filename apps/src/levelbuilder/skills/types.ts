export interface SkillsByConcept {
  [key: string]: Array<Skill>;
}

export interface Skill {
  id: string;
  key: string;
  concept: string;
  description: string;
  evaluationCriteria: string;
}
