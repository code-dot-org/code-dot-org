import {assert} from '../util/configuredChai';

var Cell = require('@cdo/apps/maze/cell');

describe("Cell", function () {
  it("counts as dirt whenever it has a value", function () {
    assert.equal(false, new Cell(0).isDirt());
    assert.equal(false, new Cell(0, undefined).isDirt());
    assert.equal(true, new Cell(0, 1).isDirt());
    assert.equal(true, new Cell(0, -11).isDirt());
    assert.equal(false, new Cell(1).isDirt());
    assert.equal(false, new Cell(1, undefined).isDirt());
    assert.equal(true, new Cell(1, 1).isDirt());
    assert.equal(true, new Cell(1, -11).isDirt());
  });
});
