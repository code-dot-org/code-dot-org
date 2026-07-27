import type {LabFixtures} from '@code-dot-org/core/api/mocks';

import simple from './simple';

// Per-tag mock scenarios for World Lab. The studio host (and the standalone demo
// harness) register these under the lab key `world`; the route's channelId picks
// the active tag (e.g. `/projects/world/simple/edit`).
export const WorldFixtures: LabFixtures = {
  simple,
};
