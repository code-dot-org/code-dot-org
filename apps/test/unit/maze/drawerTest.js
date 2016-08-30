import { assert } from '../../util/configuredChai';
import Drawer from '@cdo/apps/maze/drawer';

describe("Drawer", function () {
  it("can generate the correct cellIds", function () {
    assert.equal(Drawer.cellId('dirt', 0, 0), 'dirt_0_0');
    assert.equal(Drawer.cellId('dirt', 2, 4), 'dirt_2_4');
    assert.equal(Drawer.cellId('dirt', 1, 5), 'dirt_1_5');
    assert.equal(Drawer.cellId('dirt', 3, 1), 'dirt_3_1');
  });
});

