/** Defines a rubric entry (learning goal) in internal unit data */
export interface LearningGoalDefinition {
  key: string;
  position: number;
  learning_goal: string;
  ai_enabled: boolean;
  tips: string | null;
  seeding_key: {
    ['learning_goal.key']: string;
    ['lesson.key']: string;
    ['lesson_group.key']: string;
    ['script.name']: string;
  };
}
