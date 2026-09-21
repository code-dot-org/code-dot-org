import {
  findConfigForFile,
  getPopulatedFileTypeConfigs,
  sortBackpackFiles,
} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Backpack/backpackFileFilters';

const named = (...fileNames: string[]) =>
  fileNames.map(fileName => ({fileName}));

const idsAndCounts = (
  populated: ReturnType<typeof getPopulatedFileTypeConfigs>
) => populated.map(({config, count}) => [config.id, count]);

describe('getPopulatedFileTypeConfigs', () => {
  it('lists only file types with files, in menu order, with counts', () => {
    const populated = getPopulatedFileTypeConfigs(
      ['app.js', 'a.png', 'b.png', 'c.jpg', 'index.html'],
      ['js', 'png', 'jpeg', 'jpg', 'html']
    );
    expect(idsAndCounts(populated)).toEqual([
      ['jpeg', 1],
      ['png', 2],
      ['html', 1],
      ['js', 1],
    ]);
  });

  it('counts jpg and jpeg as one file type', () => {
    const populated = getPopulatedFileTypeConfigs(
      ['a.jpg', 'b.jpeg'],
      ['jpeg', 'jpg']
    );
    expect(idsAndCounts(populated)).toEqual([['jpeg', 2]]);
  });

  it('is case insensitive', () => {
    const populated = getPopulatedFileTypeConfigs(['sprite.PNG'], ['png']);
    expect(idsAndCounts(populated)).toEqual([['png', 1]]);
  });

  it('folds file types the lab does not support into one other entry, listed last', () => {
    const populated = getPopulatedFileTypeConfigs(
      ['main.py', 'scores.csv', 'notes.md'],
      ['py']
    );
    expect(idsAndCounts(populated)).toEqual([
      ['py', 1],
      ['other', 2],
    ]);
    // The other entry carries the folded extensions so findConfigForFile can match them.
    expect(populated[1].config.extensions).toEqual(['csv', 'md']);
  });

  it('folds unknown and extensionless names into the other entry', () => {
    const populated = getPopulatedFileTypeConfigs(
      ['mystery.xyz', 'README'],
      ['py']
    );
    expect(idsAndCounts(populated)).toEqual([['other', 2]]);
  });

  it('returns nothing for an empty backpack', () => {
    expect(getPopulatedFileTypeConfigs([], ['py'])).toEqual([]);
  });
});

describe('findConfigForFile', () => {
  const populated = getPopulatedFileTypeConfigs(
    ['a.png', 'b.jpg', 'main.py'],
    ['png', 'jpeg', 'jpg']
  );

  it('finds the populated file type whose extensions include the file', () => {
    expect(findConfigForFile('a.png', populated).id).toBe('png');
    expect(findConfigForFile('b.jpg', populated).id).toBe('jpeg');
  });

  it('finds the other entry for a file folded into it', () => {
    expect(findConfigForFile('main.py', populated).id).toBe('other');
  });

  it('falls back to other for unknown and extensionless names', () => {
    expect(findConfigForFile('mystery.xyz', populated).id).toBe('other');
    expect(findConfigForFile('README', populated).id).toBe('other');
  });
});

describe('sortBackpackFiles', () => {
  const files = named('index.html', 'app.js', 'zebra.png', 'style.css');

  it('sorts by name in both directions', () => {
    expect(
      sortBackpackFiles(files, 'name-asc').map(({fileName}) => fileName)
    ).toEqual(['app.js', 'index.html', 'style.css', 'zebra.png']);
    expect(
      sortBackpackFiles(files, 'name-desc').map(({fileName}) => fileName)
    ).toEqual(['zebra.png', 'style.css', 'index.html', 'app.js']);
  });

  it('sorts by file type, then extension, then name', () => {
    expect(
      sortBackpackFiles(
        named('b.png', 'app.js', 'a.png', 'index.html', 'z.gif', 'a.jpg'),
        'file-type'
      ).map(({fileName}) => fileName)
    ).toEqual(['a.jpg', 'a.png', 'b.png', 'z.gif', 'index.html', 'app.js']);
  });

  it('leaves the input array untouched', () => {
    const original = [...files];
    sortBackpackFiles(files, 'name-desc');
    expect(files).toEqual(original);
  });
});
