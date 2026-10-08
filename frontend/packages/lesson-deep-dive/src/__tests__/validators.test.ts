import {describe, expect, it} from 'vitest';

import {challengeResponseValidator} from '../types';

const base = {
  id: 1,
  challenge_id: 2,
  user_id: 3,
  student_text: null,
  transcript: null,
  evaluation_status: null,
  is_final: true,
  created_at: '2024-01-01T00:00:00Z',
  assets: [],
};

describe('challengeResponseValidator — approved field', () => {
  it('defaults to false when the field is absent', () => {
    expect(challengeResponseValidator(base).approved).toBe(false);
  });

  it('is true when the server sends true', () => {
    expect(challengeResponseValidator({...base, approved: true}).approved).toBe(
      true,
    );
  });

  it('is false for truthy non-boolean values (strict equality check)', () => {
    expect(challengeResponseValidator({...base, approved: 1}).approved).toBe(
      false,
    );
  });
});
