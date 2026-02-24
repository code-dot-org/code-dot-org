/**
 * The different environments our code can run in.
 *
 * - development: Local development environment (localhost).
 * - adhoc: Ad-hoc deployed testing environment.
 * - levelbuilder: Levelbuilder environment for creating and editing levels.
 * - staging: Staging environment.
 * - test: Testing environment for automated tests.
 * - production: Live production environment (e.g., code.org).
 */
export type Environment =
  | 'development'
  | 'adhoc'
  | 'levelbuilder'
  | 'staging'
  | 'test'
  | 'production';
