/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetLevel
// ====================================================

export interface GetLevel_level {
  __typename: "Level";
  id: string;
  kind: string;
  title: string;
  isBonus: boolean;
  isConcept: boolean;
  isUnplugged: boolean;
}

export interface GetLevel {
  /**
   * Gets a level by (scriptId, levelId)
   */
  level: GetLevel_level;
}

export interface GetLevelVariables {
  scriptId: string;
  levelId: string;
}
