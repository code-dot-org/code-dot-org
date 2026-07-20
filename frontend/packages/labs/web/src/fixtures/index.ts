import type {LabFixtures} from '@code-dot-org/core/api/mocks';

import network from './network';
import pages from './pages';
import predict from './predict';
import simple from './simple';

// Per-tag mock scenarios for Web Lab. The studio host (and the standalone demo
// harness) register these under the lab key `web`; the route's channelId picks
// the active tag.
export const WebFixtures: LabFixtures = {
  simple,
  predict,
  network,
  pages,
};
