import {
  createLevelPropertyFixture,
  type LabFixture,
} from '@code-dot-org/core/api/mocks';

import {AppMode} from '../oceans/constants';
import type {OceansLevelPropertiesInput} from '../schema';

// Minimal scenario: a single FishVTrash level. AI for Oceans is a no-sources
// activity, so the fixture carries only level_properties — no channel or
// sources. level_properties resolves to these baked values (the same map
// answers the standalone-project endpoint the studio host hits).
const simple: LabFixture = {
  levelProperties: {
    '1': createLevelPropertyFixture<OceansLevelPropertiesInput>({
      id: 1,
      appName: 'fish',
      type: 'Oceans',
      name: 'AI for Oceans: Fish vs Trash',
      // Oceans-specific activity configuration.
      appMode: AppMode.FishVTrash,
      // No project / sources for this lab.
      isProjectLevel: false,
      usesProjects: false,
      hideShareAndRemix: true,
      // Required nullable base fields (wire shape).
      offerBrowserTts: false,
      showExemplarLink: false,
      parentLevelLink: null,
      exemplarSources: null,
    }),
  },
  // Minimal app options so the studio host can drive the level through
  // `loadLab` (which populates `state.lab.levelProperties` for progression).
  appOptions: {
    levelId: 1,
    channel: null,
    publicCaching: null,
    displayTheme: null,
    isSignedIn: false,
  },
  theme: {},
};

export default simple;
