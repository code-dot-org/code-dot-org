export interface TeachingProfileDataState {
  selectedGoals?: string[];
  selectedSupports?: string[];
  otherSupportText?: string;
  otherGoalText?: string;
  selectedConfidence?: number;
  yearsTeaching?: number;
  dateYearsTeachingSet?: string | null;
  classroomVision?: string;
  challenge?: string;
  matchedPersona?: string;
}

export interface TeachingProfileState {
  data: TeachingProfileDataState | null;
  loading: boolean;
  error: string | null;
  exists: boolean;
  hasFetched: boolean;
}
