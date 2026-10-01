import type {LabFixtures} from '@code-dot-org/core/api/mocks';

import freeplay from './freeplay';
import hoai2026 from './hoai2026';
import image from './image';
import music from './music';
import simple from './simple';

// Per-tag scenarios for Sprite Lab. Studio's MSW boot registers
// these under the lab key `sprite`; the route's channelId picks the active
// tag (e.g. `/projects/sprite/simple/edit`).
export const SpriteFixtures: LabFixtures = {
  simple,
  freeplay,
  hoai2026,
  image,
  music,
};
