/** Defines a rubric entry (learning goal) assessment criteria in internal unit data */
export interface LearningGoalEvidenceLevelDefinition {
  understanding: number;
  teacher_description: string;
  ai_prompt: string;
  seeding_key: {
    understanding: number;
    ['learning_goal.key']: string;
    ['lesson.key']: string;
    ['lesson_group.key']: string;
    ['script.name']: string;
  };
}
