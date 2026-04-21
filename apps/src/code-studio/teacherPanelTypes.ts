// Types for teacherPanelRedux.js. These types are incomplete. To be expanded as
// more fields are used from typescript.

export interface LevelWithProgress {
  userId: number;
  status: string;
  attempts?: number;
  timeSpent?: number;
  updatedAt?: string;
}

export interface TeacherPanelState {
  hasLoadedLevelsWithProgress: boolean;
  levelsWithProgress: LevelWithProgress[];
}
