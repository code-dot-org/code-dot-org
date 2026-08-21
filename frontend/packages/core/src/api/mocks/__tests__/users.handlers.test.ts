// The mocked current user, checked against the schema that will parse it.
//
// A handler answers 200 with whatever it likes, and a body the schema rejects
// fails in the quietest possible way: react-query keeps the error, `data` stays
// undefined, nothing reaches the console, and every feature gated on knowing
// who is signed in silently behaves as though nobody is. This exact mock
// shipped once without `in_section` and `created_at`, and the symptom was an AI
// Tutor that insisted a teacher had disabled it.

import {describe, expect, it} from 'vitest';

import {CurrentUserResponseSchema} from '../../dashboard/users/users.schemata';
import {MOCK_CURRENT_USER} from '../users.handlers';

describe('MOCK_CURRENT_USER', () => {
  it('parses as a current-user response', () => {
    expect(() =>
      CurrentUserResponseSchema.parse(MOCK_CURRENT_USER),
    ).not.toThrow();
  });

  it('is signed in, or there is nothing to develop against', () => {
    expect(MOCK_CURRENT_USER.is_signed_in).toBe(true);
  });

  it('has AI chat enabled', () => {
    // A harness standing in for a student with no AI access would render every
    // AI feature as a notice saying a teacher had switched it off — true to
    // production, and useless.
    expect(MOCK_CURRENT_USER.ai_chat_access_level).toBe('enabled');
  });
});
