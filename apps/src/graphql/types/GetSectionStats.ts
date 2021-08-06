/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSectionStats
// ====================================================

export interface GetSectionStats_section_students_progress {
  __typename: "UserProgress";
  totalLinesOfCode: number;
  levelsPassed: number;
}

export interface GetSectionStats_section_students {
  __typename: "User";
  name: string;
  progress: GetSectionStats_section_students_progress;
}

export interface GetSectionStats_section {
  __typename: "Section";
  id: string;
  students: GetSectionStats_section_students[];
}

export interface GetSectionStats {
  /**
   * Gets a section by id
   */
  section: GetSectionStats_section;
}

export interface GetSectionStatsVariables {
  sectionId: string;
}
