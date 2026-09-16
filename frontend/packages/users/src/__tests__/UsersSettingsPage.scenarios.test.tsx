import {fireEvent, render, screen, within} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';

import {createQueryClient, QueryClientProvider} from '@code-dot-org/core/api';
import {setActiveScenario} from '@code-dot-org/core/api/mocks';

import {
  USERS_LAB_KEY,
  registerUsersFixtures,
  resetUsersFixtures,
} from '../fixtures';
import {
  ACCOUNT_SCENARIOS,
  USERS_SCENARIO_TAGS,
  type UsersScenarioTag,
} from '../fixtures/scenarios';
import UsersSettingsPage from '../UsersSettingsPage';

// Holds every scenario to its own settings: an affordance appears exactly when
// the entitlement the server sent allows it. Expectations are computed from the
// same fixture the mock serves, so a scenario added later is covered the day it
// lands, and a fixture whose settings stop matching the UI fails here.
//
// `fixtures.test.ts` covers the layer below (what the mock serves on the wire);
// this covers fixture -> rendered page. None of it needs layout or hit-testing,
// so it belongs in jsdom; the Playwright specs keep only what a real browser can
// answer. Scenarios are split into cohorts rather than branched on inside a test,
// so every assertion runs unconditionally.

// Same harness as UsersSettingsPage.test.tsx and .axe.test.tsx; worth extracting
// to a shared helper once a fourth file needs it.
function renderPage(tag: UsersScenarioTag) {
  registerUsersFixtures();
  setActiveScenario({labKey: USERS_LAB_KEY, tag});
  const client = createQueryClient({queries: {retry: false}});
  render(
    <QueryClientProvider client={client}>
      <UsersSettingsPage tab="account-details" onTabChange={() => {}} />
    </QueryClientProvider>,
  );
}

// Absence is asserted as an empty query, so a control that renders under a
// different name fails rather than quietly satisfying a negative assertion.
function expectCount(actual: number, expected: boolean) {
  expect(actual).toBe(expected ? 1 : 0);
}

const settingsFor = (tag: UsersScenarioTag) => ACCOUNT_SCENARIOS[tag].settings;

const STUDENTS = USERS_SCENARIO_TAGS.filter(
  tag => settingsFor(tag).user_type === 'student',
);
const DELETABLE = USERS_SCENARIO_TAGS.filter(
  tag => settingsFor(tag).can_delete_own_account,
);
// A teacher whose students depend on them for login carries the heavy gate —
// the rule legacy collapses to once its `hasStudents` is `count > 0`.
const isGated = (tag: UsersScenarioTag) =>
  settingsFor(tag).user_type === 'teacher' &&
  settingsFor(tag).dependent_students_count > 0;
const GATED = DELETABLE.filter(isGated);
const UNGATED = DELETABLE.filter(tag => !isGated(tag));

async function openDeleteDialog(tag: UsersScenarioTag) {
  renderPage(tag);
  await screen.findByRole('tablist');
  fireEvent.click(screen.getByRole('button', {name: /delete my account/i}));
  return screen.findByRole('alertdialog', {name: /delete/i});
}

afterEach(() => resetUsersFixtures());

describe('UsersSettingsPage — affordances follow the entitlements sent', () => {
  it.each(USERS_SCENARIO_TAGS)('%s', async tag => {
    const settings = settingsFor(tag);
    const isStudent = settings.user_type === 'student';

    renderPage(tag);
    await screen.findByRole('tablist');

    expectCount(
      screen.queryAllByRole('button', {name: 'Update email'}).length,
      settings.should_see_edit_email_link,
    );
    expectCount(
      screen.queryAllByRole('button', {name: 'Update password'}).length,
      settings.has_password && settings.can_edit_password,
    );
    // Create password is its own entitlement, not the inverse of the above: an
    // oauth-only student gets neither button.
    expectCount(
      screen.queryAllByRole('button', {name: 'Create password'}).length,
      !settings.has_password && settings.should_see_add_password_form,
    );
    expectCount(
      screen.queryAllByRole('combobox', {name: /account type/i}).length,
      settings.can_change_user_type,
    );

    // Either the destructive control or the reason it is unavailable — never
    // both, and never neither.
    expectCount(
      screen.queryAllByRole('button', {name: /delete my account/i}).length,
      settings.can_delete_own_account,
    );
    expectCount(
      screen.queryAllByText(/do not have permission to delete this account/i)
        .length,
      !settings.can_delete_own_account,
    );

    // Students never see their stored address: a different accessible name, and
    // a masked value in place of the real one. Located by role and accessible
    // name because DSCO puts the helper message inside the <label>, so the
    // label's text is more than the field's name.
    const email = screen.getByRole('textbox', {
      name: isStudent ? 'Email address, encrypted' : /^Email address/,
    });
    expect(email).toHaveValue(
      isStudent ? '***encrypted***' : (settings.email ?? ''),
    );

    expectCount(
      screen.queryAllByRole('region', {name: 'For Parents and Guardians'})
        .length,
      isStudent,
    );
  });
});

describe('UsersSettingsPage — parent/guardian details reflect what is on file', () => {
  it.each(STUDENTS)('%s', async tag => {
    const {parent_email: parentEmail} = settingsFor(tag);

    renderPage(tag);
    await screen.findByRole('tablist');

    const parents = screen.getByRole('region', {
      name: 'For Parents and Guardians',
    });
    expect(parents).toHaveTextContent(parentEmail ?? 'None');
    // Remove only means something once an address is on file.
    expectCount(
      within(parents).queryAllByRole('button', {
        name: 'Remove parent/guardian email',
      }).length,
      Boolean(parentEmail),
    );
  });
});

describe('UsersSettingsPage — delete asks more of a teacher with dependents', () => {
  it.each(GATED)('%s', async tag => {
    const settings = settingsFor(tag);
    const dialog = await openDeleteDialog(tag);

    // Guidance first, and its copy pluralises off the count.
    const next = within(dialog).getByRole('button', {name: 'Next'});
    expect(dialog).toHaveTextContent(
      settings.dependent_students_count === 1
        ? 'their account first'
        : 'their accounts first',
    );
    fireEvent.click(next);

    expect(within(dialog).getAllByRole('checkbox')).toHaveLength(5);
    expectCount(
      within(dialog).queryAllByLabelText(/current password/i).length,
      settings.has_password,
    );
  });
});

describe('UsersSettingsPage — delete goes straight to confirm otherwise', () => {
  it.each(UNGATED)('%s', async tag => {
    const settings = settingsFor(tag);
    const dialog = await openDeleteDialog(tag);

    expect(
      within(dialog).queryAllByRole('button', {name: 'Next'}),
    ).toHaveLength(0);
    expect(within(dialog).queryAllByRole('checkbox')).toHaveLength(0);
    expectCount(
      within(dialog).queryAllByLabelText(/current password/i).length,
      settings.has_password,
    );
  });
});

describe('UsersSettingsPage — a state only one scenario reaches', () => {
  it('offers a disabled placeholder for an unset age and state (age-state-unset)', async () => {
    renderPage('age-state-unset');
    await screen.findByRole('tablist');

    for (const [name, value] of [
      [/^Age/, '14'],
      [/^State/, 'WA'],
    ] as const) {
      const select = screen.getByRole('combobox', {name});
      expect(select).toHaveValue('');

      // Disabled, so the dropdown offers no way to blank a value once set. That
      // the browser enforces `disabled` is the platform's business, not ours.
      expect(
        within(select).getByRole('option', {name: /^Select/}),
      ).toBeDisabled();

      fireEvent.change(select, {target: {value}});
      expect(select).toHaveValue(value);
    }
  });
});
