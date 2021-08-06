/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: StudentMutation
// ====================================================

export interface StudentMutation_updateUser_user {
  __typename: "User";
  id: string;
  age: number | null;
  gender: string | null;
  name: string;
}

export interface StudentMutation_updateUser {
  __typename: "UpdateUserPayload";
  user: StudentMutation_updateUser_user | null;
}

export interface StudentMutation {
  updateUser: StudentMutation_updateUser | null;
}

export interface StudentMutationVariables {
  id: string;
  input: UserInput;
}
