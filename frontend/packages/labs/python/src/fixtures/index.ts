import type {LabFixtures} from '@code-dot-org/core/api/mocks';

import simple from './simple';

// Per-tag mock scenarios for Python Lab. The studio host (and the standalone
// demo harness) register these under the lab key `python`; the route's channelId
// picks the active tag.
export const PythonFixtures: LabFixtures = {
  simple,
};
