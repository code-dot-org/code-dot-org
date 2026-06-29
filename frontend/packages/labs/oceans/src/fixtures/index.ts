import type {LabFixtures} from '@code-dot-org/core/api/mocks';

import simple from './simple';

// Per-tag scenarios for AI for Oceans. Studio's MSW boot registers these under
// the lab key `oceans`; the route's channelId picks the active tag.
export const OceansFixtures: LabFixtures = {
  simple,
};
