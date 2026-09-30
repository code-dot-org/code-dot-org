import type {LabFixtures} from '@code-dot-org/core/api/mocks';

import simple from './simple';

// Per-tag scenarios for Sprite Lab. Studio's MSW boot registers
// these under the lab key `sprite`; the route's channelId picks the active
// tag (e.g. `/projects/sprite/simple/edit`).
export const SpriteFixtures: LabFixtures = {
  simple,
};
