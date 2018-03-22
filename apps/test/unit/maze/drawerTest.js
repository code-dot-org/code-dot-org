import { expect } from '../../util/configuredChai';
import Drawer from '@cdo/apps/maze/drawer';

describe("Drawer", function () {
  it("can generate the correct cellIds", function () {
    expect(Drawer.cellId('dirt', 0, 0)).to.equal('dirt_0_0');
    expect(Drawer.cellId('dirt', 2, 4)).to.equal('dirt_2_4');
    expect(Drawer.cellId('dirt', 1, 5)).to.equal('dirt_1_5');
    expect(Drawer.cellId('dirt', 3, 1)).to.equal('dirt_3_1');
  });
});

