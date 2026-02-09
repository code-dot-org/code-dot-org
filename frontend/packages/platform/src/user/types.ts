import {
  OAuthSectionTypes,
  SignInStates,
  CourseRoles,
  UserTypes,
} from './constants';

export type OAuthSectionType =
  (typeof OAuthSectionTypes)[keyof typeof OAuthSectionTypes];
export type SignInState = (typeof SignInStates)[keyof typeof SignInStates];
export type CourseRole = (typeof CourseRoles)[keyof typeof CourseRoles];
export type UserType = (typeof UserTypes)[keyof typeof UserTypes];
