/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetProjects
// ====================================================

export interface GetProjects_section_students_projects {
  __typename: "Project";
  name: string | null;
  channel: string | null;
  type: string | null;
  thumbnailUrl: string | null;
  publishedAt: any | null;
  updatedAt: any | null;
}

export interface GetProjects_section_students {
  __typename: "User";
  name: string;
  projects: GetProjects_section_students_projects[];
}

export interface GetProjects_section {
  __typename: "Section";
  id: string;
  students: GetProjects_section_students[];
}

export interface GetProjects {
  /**
   * Gets a section by id
   */
  section: GetProjects_section;
}

export interface GetProjectsVariables {
  sectionId: string;
}
