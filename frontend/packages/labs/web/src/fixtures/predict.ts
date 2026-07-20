import {
  createLevelPropertyFixture,
  type LabFixture,
} from '@code-dot-org/core/api/mocks';

import {DEFAULT_PROJECT} from '../constants';

// A predict-level scenario, for exercising the script gate: until the student
// submits a prediction, the preview serves their page with `script-src 'none'`,
// so `script.js` never runs. See preview/scriptPolicy.ts.
const predict: LabFixture = {
  sources: {source: DEFAULT_PROJECT.source},
  levelProperties: {
    '1': createLevelPropertyFixture({
      id: 1,
      name: 'Web Lab predict',
      type: 'Weblab2',
      appName: 'weblab2',
      usesProjects: true,
      isProjectLevel: true,
      offerBrowserTts: false,
      showExemplarLink: false,
      exemplarSources: null,
      predictSettings: {
        isPredictLevel: true,
        questionType: 'freeResponse',
        allowMultipleAttempts: false,
        placeholderText: 'What will the page do when it runs?',
      },
      longInstructions:
        '## Predict\n\nRead `script.js` and predict what the page will do, ' +
        'then submit your answer to see it run.',
    }),
  },
  theme: {},
};

export default predict;
