import type {LabFixture} from '@code-dot-org/core/api/mocks';

import simple from './simple';

// The simple project on a freeplay level: every tab, the expanded adlibs,
// and the paint tools, which only freeplay offers.
const freeplay: LabFixture = {
  ...simple,
  levelProperties: {
    '1': {...simple.levelProperties?.['1'], levelMode: {kind: 'freeplay'}},
  } as LabFixture['levelProperties'],
};

export default freeplay;
