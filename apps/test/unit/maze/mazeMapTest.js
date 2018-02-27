const expect = require('../../util/configuredChai').expect;

const MazeMap = require('@cdo/apps/maze/mazeMap');
const Cell = require('@cdo/apps/maze/cell');

describe("MazeMap", function () {
  it("can deserialize serialized values", function () {
    const serializedValues = [
      [{tileType: 1, value: 4}, {tileType: 2, value: 3}],
      [{tileType: 3, value: 2}, {tileType: 4, value: 1}]
    ];
    const mazeMap = MazeMap.deserialize(serializedValues, Cell);

    expect(mazeMap.getCell(0, 0)).to.deep.equal(new Cell(1, 4));
    expect(mazeMap.getCell(0, 1)).to.deep.equal(new Cell(2, 3));
    expect(mazeMap.getCell(1, 0)).to.deep.equal(new Cell(3, 2));
    expect(mazeMap.getCell(1, 1)).to.deep.equal(new Cell(4, 1));
  });

  it("can parse from old (deprecated) maze initialization values", function () {
    const map = [
      [0, 1],
      [2, 3]
    ];
    const initialDirt = [
      [0, "-1"],
      ["1", 0]
    ];
    const mazeMap = MazeMap.parseFromOldValues(map, initialDirt, Cell);

    expect(mazeMap.getCell(0, 0)).to.deep.equal(new Cell(0));
    expect(mazeMap.getCell(0, 1)).to.deep.equal(new Cell(1, -1));
    expect(mazeMap.getCell(1, 0)).to.deep.equal(new Cell(2, 1));
    expect(mazeMap.getCell(1, 1)).to.deep.equal(new Cell(3));
  });

  it("can generate a variety of static grids when initialized with variable cells", function () {
    const serializedValues = [
      [{tileType: 1, value: 1, range: 2}, {tileType: 2, value: 1}],
      [{tileType: 3, value: 1}, {tileType: 4, value: 2, range: 3}]
    ];

    const mazeMap = MazeMap.deserialize(serializedValues, Cell);
    expect(mazeMap.hasMultiplePossibleGrids()).to.be.true;
    expect(mazeMap.staticGrids.length).to.equal(4);

    mazeMap.useGridWithId(0);
    expect(mazeMap.getCell(0, 0)).to.deep.equal(new Cell(1, 1));
    expect(mazeMap.getCell(1, 1)).to.deep.equal(new Cell(4, 2));

    mazeMap.useGridWithId(1);
    expect(mazeMap.getCell(0, 0)).to.deep.equal(new Cell(1, 2));
    expect(mazeMap.getCell(1, 1)).to.deep.equal(new Cell(4, 2));

    mazeMap.useGridWithId(2);
    expect(mazeMap.getCell(0, 0)).to.deep.equal(new Cell(1, 1));
    expect(mazeMap.getCell(1, 1)).to.deep.equal(new Cell(4, 3));

    mazeMap.useGridWithId(3);
    expect(mazeMap.getCell(0, 0)).to.deep.equal(new Cell(1, 2));
    expect(mazeMap.getCell(1, 1)).to.deep.equal(new Cell(4, 3));
  });
});
