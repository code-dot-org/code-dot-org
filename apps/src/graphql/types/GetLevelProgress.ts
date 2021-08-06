/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetLevelProgress
// ====================================================

export interface GetLevelProgress_user_progress_levelProgress {
  __typename: "LevelProgress";
  levelId: string;
  status: string;
  isLocked: boolean;
  isPaired: boolean;
}

export interface GetLevelProgress_user_progress {
  __typename: "UserProgress";
  levelProgress: GetLevelProgress_user_progress_levelProgress[];
}

export interface GetLevelProgress_user {
  __typename: "User";
  id: string;
  name: string;
  progress: GetLevelProgress_user_progress;
}

export interface GetLevelProgress {
  /**
   * Gets a user by id
   */
  user: GetLevelProgress_user;
}

export interface GetLevelProgressVariables {
  userId: string;
  scriptId: string;
}
