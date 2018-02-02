import { expect } from '../../util/configuredChai';
import Cell from '@cdo/apps/maze/cell';

describe("Cell", function () {
  it("counts as dirt whenever it has a value", function () {
    expect(false).to.equal(new Cell(0).isDirt());
    expect(false).to.equal(new Cell(0, undefined).isDirt());
    expect(true).to.equal(new Cell(0, 1).isDirt());
    expect(true).to.equal(new Cell(0, -11).isDirt());
    expect(false).to.equal(new Cell(1).isDirt());
    expect(false).to.equal(new Cell(1, undefined).isDirt());
    expect(true).to.equal(new Cell(1, 1).isDirt());
    expect(true).to.equal(new Cell(1, -11).isDirt());
  });
});
