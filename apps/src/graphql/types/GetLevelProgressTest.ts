/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetLevelProgressTest
// ====================================================

export interface GetLevelProgressTest_user_progress_levelProgress {
  __typename: "LevelProgress";
  levelId: string;
  status: string;
  isLocked: boolean;
  isPaired: boolean;
}

export interface GetLevelProgressTest_user_progress {
  __typename: "UserProgress";
  levelProgress: GetLevelProgressTest_user_progress_levelProgress[];
}

export interface GetLevelProgressTest_user {
  __typename: "User";
  id: string;
  name: string;
  progress: GetLevelProgressTest_user_progress;
}

export interface GetLevelProgressTest {
  /**
   * Gets a user by id
   */
  user: GetLevelProgressTest_user;
}
