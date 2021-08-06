/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSection
// ====================================================

export interface GetSection_section_students {
  __typename: "User";
  id: string;
  name: string;
  username: string;
  email: string | null;
  age: number | null;
  gender: string | null;
  secretWords: string | null;
  secretPicturePath: string | null;
  hasEverSignedIn: boolean;
  userType: string;
}

export interface GetSection_section {
  __typename: "Section";
  id: string;
  code: string | null;
  name: string | null;
  loginType: string;
  students: GetSection_section_students[];
}

export interface GetSection {
  /**
   * Gets a section by id
   */
  section: GetSection_section;
}

export interface GetSectionVariables {
  sectionId: string;
}
