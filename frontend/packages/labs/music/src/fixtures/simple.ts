import type {LabFixture} from '@code-dot-org/core/api/mocks';

// Minimal scenario. The lab renders without Rails; level_properties and theme
// resolve to empty values. Richer fixtures will populate `channel`, `sources`,
// and a real `levelProperties` map once those handlers land.
const simple: LabFixture = {
  levelProperties: {},
  theme: {},
};

export default simple;
