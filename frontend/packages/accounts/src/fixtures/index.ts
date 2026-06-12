// MSW fixtures for the account settings endpoints, registered through core's
// generic `registerMockFixture` registry (design D6). The standalone dev server
// and Studio's MSW mode both consume them. Reads layer scenario-store
// write-through over seed data so a successful mutation shows up on the next
// read; the mutation routes also serve the real captured 422/400 bodies for
// invalid input.

import {
  clearActiveScenario,
  clearMockFixtures,
  registerMockFixture,
  resetScenarioStore,
  type MockResponderContext,
  type MockRoute,
} from '@code-dot-org/core/api/mocks';

import {
  DELETE_WRONG_PASSWORD,
  MALFORMED_EMAIL,
  SHORT_PASSWORD,
  TAKEN_USERNAME,
  WRONG_PASSWORD,
} from './errorBodies';
import {
  ACCOUNT_SCENARIOS,
  ACCOUNTS_SCENARIO_TAGS,
  type AccountScenario,
  type AccountSettingsWire,
  type AccountsScenarioTag,
} from './scenarios';

export {ACCOUNTS_SCENARIO_TAGS};
export type {AccountsScenarioTag};

export const ACCOUNTS_LAB_KEY = 'accounts';

const JSON_HEADERS = {'content-type': 'application/json'};

function json(body: unknown, status = 200): Response {
  return new Response(body == null ? null : JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asNullableString(value: unknown): string | null | undefined {
  if (typeof value === 'string') return value;
  if (value === null) return null;
  return undefined;
}

function asStringOrNumber(value: unknown): string | number | undefined {
  return typeof value === 'string' || typeof value === 'number'
    ? value
    : undefined;
}

function readSettings(
  ctx: MockResponderContext,
  scenario: AccountScenario,
): AccountSettingsWire {
  return ctx.store.read<AccountSettingsWire>('settings') ?? scenario.settings;
}

async function readJson(ctx: MockResponderContext): Promise<unknown> {
  return ctx.request.json().catch(() => ({}));
}

async function readUserBody(
  ctx: MockResponderContext,
): Promise<Record<string, unknown>> {
  const body = await readJson(ctx);
  return isRecord(body) && isRecord(body.user) ? body.user : {};
}

function scenarioRoutes(tag: AccountsScenarioTag): MockRoute[] {
  const scenario = ACCOUNT_SCENARIOS[tag];

  return [
    {
      method: 'get',
      path: '*/api/v1/users/current',
      respond: ctx => ctx.store.read('currentUser') ?? scenario.currentUser,
    },
    {
      method: 'get',
      path: '*/api/v1/account/settings',
      respond: ctx => readSettings(ctx, scenario),
    },
    // Profile + password save bar — PATCH /dashboardapi/users.
    {
      method: 'patch',
      path: '*/dashboardapi/users',
      respond: async ctx => {
        const user = await readUserBody(ctx);
        if (user.username === 'taken') return json(TAKEN_USERNAME, 422);
        if (typeof user.password === 'string' && user.password.length < 6) {
          return json(SHORT_PASSWORD, 422);
        }

        const givenName = asNullableString(user.given_name);
        const familyName = asNullableString(user.family_name);
        const displayName = asString(user.name);
        const age = asStringOrNumber(user.age);
        const usState = asNullableString(user.us_state);

        const settings: AccountSettingsWire = {
          ...readSettings(ctx, scenario),
          ...(givenName !== undefined && {given_name: givenName}),
          ...(familyName !== undefined && {family_name: familyName}),
          ...(displayName !== undefined && {display_name: displayName}),
          ...(age !== undefined && {age}),
          ...(usState !== undefined && {us_state: usState}),
          ...(typeof user.password === 'string' && {has_password: true}),
        };
        ctx.store.write('settings', settings);

        if (displayName !== undefined) {
          const current = ctx.store.read('currentUser') ?? scenario.currentUser;
          ctx.store.write('currentUser', {
            ...current,
            display_name: displayName,
          });
        }
        return json(null, 204);
      },
    },
    // Email change — PATCH /users/email.
    {
      method: 'patch',
      path: '*/users/email',
      respond: async ctx => {
        const user = await readUserBody(ctx);
        if (scenario.password && user.current_password !== scenario.password) {
          return json(WRONG_PASSWORD, 422);
        }
        if (typeof user.email !== 'string' || !user.email.includes('@')) {
          return json(MALFORMED_EMAIL, 422);
        }
        ctx.store.write('settings', {
          ...readSettings(ctx, scenario),
          email: user.email,
        });
        return json(null, 204);
      },
    },
    // Account type — PATCH /users/user_type.
    {
      method: 'patch',
      path: '*/users/user_type',
      respond: async ctx => {
        const user = await readUserBody(ctx);
        if (user.user_type !== 'student' && user.user_type !== 'teacher') {
          return json({}, 422);
        }
        ctx.store.write('settings', {
          ...readSettings(ctx, scenario),
          user_type: user.user_type,
        });
        return json(null, 204);
      },
    },
    // Account deletion — DELETE /users (top-level password_confirmation; 400).
    {
      method: 'delete',
      path: '*/users',
      respond: async ctx => {
        const body = await readJson(ctx);
        const provided = isRecord(body)
          ? asString(body.password_confirmation)
          : undefined;
        if (scenario.password && provided !== scenario.password) {
          return json(DELETE_WRONG_PASSWORD, 400);
        }
        return json(null, 204);
      },
    },
  ];
}

/** Registers every account scenario's routes. Call before starting the worker. */
export function registerAccountsFixtures(): void {
  for (const tag of ACCOUNTS_SCENARIO_TAGS) {
    registerMockFixture({labKey: ACCOUNTS_LAB_KEY, tag}, scenarioRoutes(tag));
  }
}

/** Clears account fixtures and write-through state between tests. */
export function resetAccountsFixtures(): void {
  clearMockFixtures({labKey: ACCOUNTS_LAB_KEY});
  resetScenarioStore();
  clearActiveScenario();
}
