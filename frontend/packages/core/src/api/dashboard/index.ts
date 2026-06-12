export * from './auth';
export * from './channels';
export * from './courses';
export * from './levels';
export * from './metrics';
export * from './preferences';
export * from './projects';
export * from './sections';
export * from './sources';
export type {
  CurrentUserResponse,
  CurrentUserResponseSignedIn,
  CurrentUserResponseSignedOut,
} from './users/currentUserTypes';

// Current-user query surface for host apps that prime and read the shared
// TanStack Query cache (the accounts module's host contract; see
// accounts-module-v1 design D4).
export {usersKeys} from './users/users.keys';
export {useCurrentUser} from './users/users.query';
export {CurrentUserSchema} from './users/users.schemata';
export type {CurrentUser} from './users/users.types';
