// MSW fixtures for the account settings endpoints, registered through core's
// generic `registerMockFixture` registry (see design D6). The standalone dev
// server and Studio's MSW mode both consume them.
//
// The routes (current-user, settings read, the four mutations, and the
// captured 422 bodies) and the between-tests reset land in task 4.3; this is
// the shape the standalone host and Studio loader register against.

export const ACCOUNTS_LAB_KEY = 'accounts';

/** Scenario tags the fixtures expose; the active one is set per visit. */
export const ACCOUNTS_SCENARIO_TAGS = [
  'teacher',
  'student',
  'sso-only',
] as const;

export type AccountsScenarioTag = (typeof ACCOUNTS_SCENARIO_TAGS)[number];

/** Registers the account settings MSW routes. Filled out in task 4.3. */
export function registerAccountsFixtures(): void {
  // Global current-user route + per-scenario settings/mutation routes land here.
}
