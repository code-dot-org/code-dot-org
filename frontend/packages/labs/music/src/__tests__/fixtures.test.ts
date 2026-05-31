import {expect, it} from 'vitest';

import {
  DashboardApiClient,
  registerLevelKindSchema,
} from '@code-dot-org/core/api';
import {
  clearActiveScenario,
  registerLabFixtures,
  setActiveScenario,
} from '@code-dot-org/core/api/mocks';

import simple from '../fixtures/simple';
import {LevelKindSchema} from '../schema';
import type {MusicLevelProperties} from '../types';

// Drives the real API path against the MSW server installed in setup.ts: the
// handler returns the raw fixture and the client re-parses it through the base
// + kind schemas. This is what proves the fixture is valid *input* — defining
// it as `z.input` and writing `parentLevelLink: null` makes the parse succeed,
// and the Blockly/music merge keeps `levelData` instead of stripping it.
it('parses the simple fixture end to end', async () => {
  registerLevelKindSchema('music', LevelKindSchema);
  registerLabFixtures('music', {simple});
  setActiveScenario({labKey: 'music', tag: 'simple'});

  try {
    const map = await DashboardApiClient.levels.getLevelProperties({
      levelId: 46446,
    });
    // The API's static return type is the base map; the kind extension is
    // merged in at runtime, so narrow to the music shape for the assertions.
    const level = map['46446'] as MusicLevelProperties;

    // Music-specific fields survive the merge (the union dropped these).
    expect(level.levelData.library).toBe('launch2024');
    expect(level.levelData.toolbox.includeAi).toBe(true);
    expect(level.useRestrictedSongs).toBe(true);

    // Transforms ran: wire `null` becomes `undefined`.
    expect(level.parentLevelLink).toBeUndefined();
    expect(level.exemplarSources).toBeUndefined();
  } finally {
    clearActiveScenario();
  }
});
