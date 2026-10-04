// The two fields the AI tutor's access rules need.
//
// Added late and optional, because whether every endpoint that populates this
// slice carries them has not been confirmed against the serializer. The test
// that matters is the one for their ABSENCE: silence must arrive as
// `undefined`, which the rules read as "no" — a payload that forgot to say is
// not permission (`areAiChatToolsEnabled` in `@code-dot-org/aitutor`).

import {describe, expect, it} from 'vitest';

import currentUserSlice, {setInitialData} from '../currentUserSlice';
import type {CurrentUserDefinition} from '../currentUserSlice';

const reduce = currentUserSlice.reducer;

const payload = (over: Partial<CurrentUserDefinition> = {}) =>
  ({
    id: 1,
    educator_role: '',
    mute_music: false,
    sort_by_family_name: false,
    is_verified_instructor: false,
    under_13: false,
    over_21: true,
    sharing_disabled: false,
    show_progress_table_v2: false,
    progress_table_v2_closed_beta: false,
    has_seen_progress_table_v2_invitation: false,
    has_completed_ai_differentiation_welcome: false,
    age: 30,
    ...over,
  }) as CurrentUserDefinition;

describe('AI chat access', () => {
  it('carries the access level the server sent', () => {
    const state = reduce(
      undefined,
      setInitialData(payload({ai_chat_access_level: 'essential_only'})),
    );

    expect(state.aiChatAccessLevel).toBe('essential_only');
  });

  it('leaves it undefined when the payload did not say', () => {
    // Not defaulted to `enabled`, and not to `disabled` either: `undefined` is
    // "nobody said", which the access rules already read as no. Defaulting here
    // would make a missing field indistinguishable from an explicit answer.
    const state = reduce(undefined, setInitialData(payload()));

    expect(state.aiChatAccessLevel).toBeUndefined();
  });

  it('carries whether the user is a levelbuilder', () => {
    // Levelbuilders are always allowed the tutor, so that building a tutor
    // level does not require setting up an account to see the thing built.
    expect(
      reduce(undefined, setInitialData(payload({is_levelbuilder: true})))
        .isLevelbuilder,
    ).toBe(true);
    expect(
      reduce(undefined, setInitialData(payload())).isLevelbuilder,
    ).toBeUndefined();
  });
});
