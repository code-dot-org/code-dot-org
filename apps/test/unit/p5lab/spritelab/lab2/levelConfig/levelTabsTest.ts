import {
  editsWorld,
  levelTabs,
} from '@cdo/apps/p5lab/spritelab/lab2/levelConfig/levelTabs';

describe('levelTabs', () => {
  it('shows Code and Play on a plain level', () => {
    expect(levelTabs({})).toEqual(['Code', 'Play']);
  });

  it("adds each group's tab after the one the level opens on", () => {
    expect(levelTabs({images: {}, world: {}})).toEqual([
      'Code',
      'Images',
      'World',
      'Play',
    ]);
  });

  it('opens on the focus', () => {
    expect(levelTabs({focus: 'world', world: {}})).toEqual([
      'World',
      'Code',
      'Play',
    ]);
    expect(levelTabs({focus: 'play'})[0]).toBe('Play');
  });

  it('shows only Images on a level that changes nothing else and opens there', () => {
    expect(levelTabs({focus: 'images', edits: ['images'], images: {}})).toEqual(
      ['Images']
    );
  });

  it('keeps Play on a play level that also offers its images', () => {
    expect(levelTabs({focus: 'play', edits: ['images'], images: {}})).toEqual([
      'Play',
      'Images',
    ]);
  });

  it('opens on Images when the level makes its image first', () => {
    expect(
      levelTabs({
        focus: 'world',
        edits: ['images', 'world'],
        images: {makeFirst: true},
        world: {},
      })
    ).toEqual(['Images', 'World', 'Play']);
  });

  it('leaves out the tab of a group the student cannot change', () => {
    expect(levelTabs({edits: ['code'], images: {canAdd: false}})).toEqual([
      'Code',
      'Play',
    ]);
  });
});

describe('editsWorld', () => {
  it('is true on a level that opens on World', () => {
    expect(editsWorld({focus: 'world', world: {}})).toBe(true);
  });

  it('is true on a level whose only part besides images is the world', () => {
    expect(
      editsWorld({focus: 'images', edits: ['images', 'world'], world: {}})
    ).toBe(true);
  });

  it('is false on a level that opens on Code', () => {
    expect(editsWorld({world: {}})).toBe(false);
  });
});
