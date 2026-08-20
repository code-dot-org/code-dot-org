// MSW fixtures for the account settings endpoints. Reads layer a scenario-store
// write-through over seed data, so a successful mutation shows up on the next
// read; mutation routes serve the real captured 422/400 bodies for invalid input.

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
  INVALID_PARENT_EMAIL,
  MALFORMED_EMAIL,
  SHORT_PASSWORD,
  TAKEN_USERNAME,
  WRONG_PASSWORD,
} from './errorBodies';
import {
  ACCOUNT_SCENARIOS,
  USERS_SCENARIO_TAGS,
  type UsersScenario,
  type UsersSettingsSeed,
  type UsersScenarioTag,
} from './scenarios';

export {ACCOUNT_SCENARIOS, USERS_SCENARIO_TAGS};
export type {UsersScenarioTag};

export const USERS_LAB_KEY = 'users';

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

// Age / US-state option lists the mock GET injects on read — the standalone's
// stand-in for the Rails source (User::AGE_DROPDOWN_OPTIONS,
// User.us_state_dropdown_options). App code no longer hardcodes these.
const AGE_OPTIONS = [
  ...Array.from({length: 17}, (_, i) => {
    const age = String(i + 4); // 4..20
    return {value: age, text: age};
  }),
  {value: '21+', text: '21+'},
];
const US_STATE_OPTIONS = [
  ['??', 'I live somewhere not listed here'],
  ['AL', 'Alabama'],
  ['AK', 'Alaska'],
  ['AZ', 'Arizona'],
  ['AR', 'Arkansas'],
  ['CA', 'California'],
  ['CO', 'Colorado'],
  ['CT', 'Connecticut'],
  ['DE', 'Delaware'],
  ['FL', 'Florida'],
  ['GA', 'Georgia'],
  ['HI', 'Hawaii'],
  ['ID', 'Idaho'],
  ['IL', 'Illinois'],
  ['IN', 'Indiana'],
  ['IA', 'Iowa'],
  ['KS', 'Kansas'],
  ['KY', 'Kentucky'],
  ['LA', 'Louisiana'],
  ['ME', 'Maine'],
  ['MD', 'Maryland'],
  ['MA', 'Massachusetts'],
  ['MI', 'Michigan'],
  ['MN', 'Minnesota'],
  ['MS', 'Mississippi'],
  ['MO', 'Missouri'],
  ['MT', 'Montana'],
  ['NE', 'Nebraska'],
  ['NV', 'Nevada'],
  ['NH', 'New Hampshire'],
  ['NJ', 'New Jersey'],
  ['NM', 'New Mexico'],
  ['NY', 'New York'],
  ['NC', 'North Carolina'],
  ['ND', 'North Dakota'],
  ['OH', 'Ohio'],
  ['OK', 'Oklahoma'],
  ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'],
  ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'],
  ['SD', 'South Dakota'],
  ['TN', 'Tennessee'],
  ['TX', 'Texas'],
  ['UT', 'Utah'],
  ['VT', 'Vermont'],
  ['VA', 'Virginia'],
  ['WA', 'Washington'],
  ['DC', 'Washington, D.C.'],
  ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'],
  ['WY', 'Wyoming'],
].map(([value, text]) => ({value, text}));

function readSettings(
  ctx: MockResponderContext,
  scenario: UsersScenario,
): UsersSettingsSeed {
  return ctx.store.read<UsersSettingsSeed>('settings') ?? scenario.settings;
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

function scenarioRoutes(tag: UsersScenarioTag): MockRoute[] {
  const scenario = ACCOUNT_SCENARIOS[tag];

  return [
    {
      method: 'get',
      path: '*/api/v1/users/current',
      respond: ctx => ctx.store.read('currentUser') ?? scenario.currentUser,
    },
    {
      method: 'get',
      path: '*/api/v1/users/me/settings',
      respond: ctx => ({
        ...readSettings(ctx, scenario),
        age_options: AGE_OPTIONS,
        us_state_options: US_STATE_OPTIONS,
      }),
    },
    // registrations#update: one Rails action behind PATCH /users, serving both
    // the profile fields and the parent-email clear.
    {
      method: 'patch',
      path: '*/users',
      respond: async ctx => {
        const user = await readUserBody(ctx);
        if (user.username === 'taken') return json(TAKEN_USERNAME, 422);
        if ('parent_email' in user) {
          ctx.store.write('settings', {
            ...readSettings(ctx, scenario),
            parent_email: asNullableString(user.parent_email) || null,
          });
          return json(null, 204);
        }
        if (typeof user.password === 'string') {
          if (
            scenario.password &&
            user.current_password !== scenario.password
          ) {
            return json(WRONG_PASSWORD, 422);
          }
          if (user.password.length < 6) return json(SHORT_PASSWORD, 422);
        }

        const givenName = asNullableString(user.given_name);
        const familyName = asNullableString(user.family_name);
        const displayName = asString(user.name);
        const username = asString(user.username);
        const age = asStringOrNumber(user.age);
        const usState = asNullableString(user.us_state);

        const settings: UsersSettingsSeed = {
          ...readSettings(ctx, scenario),
          ...(givenName !== undefined && {given_name: givenName}),
          ...(familyName !== undefined && {family_name: familyName}),
          ...(displayName !== undefined && {display_name: displayName}),
          ...(username !== undefined && {username}),
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
    // Add/update a student's parent/guardian email.
    {
      method: 'patch',
      path: '*/users/parent_email',
      respond: async ctx => {
        const user = await readUserBody(ctx);
        const parentEmail = asString(user.parent_email);
        if (typeof parentEmail !== 'string' || !parentEmail.includes('@')) {
          return json(INVALID_PARENT_EMAIL, 422);
        }
        ctx.store.write('settings', {
          ...readSettings(ctx, scenario),
          parent_email: parentEmail,
        });
        return json(null, 204);
      },
    },
    // Sign out other sessions; this one stays signed in.
    {
      method: 'delete',
      path: '*/expire_other',
      respond: () => json(null, 204),
    },
    // CSRF refresh after a session-rotating action (e.g. expire_other). The
    // token rides the `csrf-token` response header; without this the request
    // escapes MSW to the network and errors in the standalone.
    {
      method: 'get',
      path: '*/get_token',
      respond: () =>
        new Response(null, {
          status: 200,
          headers: {'csrf-token': 'mock-csrf-token'},
        }),
    },
    // DELETE /users reads a top-level password_confirmation and rejects with 400.
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

export function registerUsersFixtures(): void {
  for (const tag of USERS_SCENARIO_TAGS) {
    registerMockFixture({labKey: USERS_LAB_KEY, tag}, scenarioRoutes(tag));
  }
}

export function resetUsersFixtures(): void {
  clearMockFixtures({labKey: USERS_LAB_KEY});
  resetScenarioStore();
  clearActiveScenario();
}
