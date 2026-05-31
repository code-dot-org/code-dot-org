import {
  createLevelPropertyFixture,
  type LabFixture,
} from '@code-dot-org/core/api/mocks';

import type {MusicLevelPropertiesInput} from '../types';

// Minimal scenario. The lab renders without Rails; level_properties and theme
// resolve to baked values. Richer fixtures will populate `channel`, `sources`,
// and a real `levelProperties` map once those handlers land.
const simple: LabFixture = {
  levelProperties: {
    '46446': createLevelPropertyFixture<MusicLevelPropertiesInput>({
      background: 'background-dark',
      isProjectLevel: true,
      encrypted: false,
      levelData: {
        library: 'launch2024',
        showSoundFilters: true,
        toolbox: {
          includeAi: true,
        },
        allowChangeStartingPlayheadPosition: true,
      },
      hideShareAndRemix: false,
      instructionsImportant: false,
      offerBrowserTts: false,
      useSecondaryFinishButton: false,
      preloadAssetList: false,
      containedLevelNames: [],
      name: 'New Music Lab Project',
      id: 46446,
      helpVideos: [],
      type: 'Music',
      appName: 'music',
      useRestrictedSongs: true,
      usesProjects: true,
      baseAssetUrl: '/blockly/',
      isAssessment: false,
      enableBlocklyKeyboardNavigation: false,
      showExemplarLink: false,
      parentLevelLink: null,
      exemplarSources: null,
      sharedBlocks: [],
    }),
  },
  theme: {},
};

export default simple;
