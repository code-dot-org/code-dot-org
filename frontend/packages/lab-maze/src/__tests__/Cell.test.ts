import Cell from '../Cell';

describe('Cell', () => {
  it('counts as dirt whenever it has a value', () => {
    expect(false).toEqual(new Cell(0).isDirt());
    expect(false).toEqual(new Cell(0, undefined).isDirt());
    expect(true).toEqual(new Cell(0, 1).isDirt());
    expect(true).toEqual(new Cell(0, -11).isDirt());
    expect(false).toEqual(new Cell(1).isDirt());
    expect(false).toEqual(new Cell(1, undefined).isDirt());
    expect(true).toEqual(new Cell(1, 1).isDirt());
    expect(true).toEqual(new Cell(1, -11).isDirt());
  });
});
