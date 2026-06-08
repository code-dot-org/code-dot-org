import type {LabFixtures} from '@code-dot-org/core/api/mocks';

import simple from './simple';

// Per-tag scenarios for Music Lab. Studio's MSW boot registers these under
// the lab key `music`; the route's channelId picks the active tag.
export const MusicFixtures: LabFixtures = {
  simple,
};
