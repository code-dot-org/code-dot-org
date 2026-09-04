import {
  getFileCategory,
  getPopulatedCategories,
  sortBackpackFiles,
} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Backpack/backpackFileFilters';

const named = (...fileNames: string[]) =>
  fileNames.map(fileName => ({fileName}));

describe('getFileCategory', () => {
  it('maps known extensions to their category', () => {
    expect(getFileCategory('sprite.PNG').id).toBe('images');
    expect(getFileCategory('beep.wav').id).toBe('audio');
    expect(getFileCategory('index.html').id).toBe('html');
    expect(getFileCategory('style.css').id).toBe('css');
    expect(getFileCategory('app.js').id).toBe('javascript');
    expect(getFileCategory('main.py').id).toBe('python');
    expect(getFileCategory('scores.csv').id).toBe('data');
    expect(getFileCategory('notes.md').id).toBe('text');
  });

  it('falls back to other for unknown and extensionless names', () => {
    expect(getFileCategory('mystery.xyz').id).toBe('other');
    expect(getFileCategory('README').id).toBe('other');
  });
});

describe('getPopulatedCategories', () => {
  it('lists only categories with files, in menu order, with counts', () => {
    const categories = getPopulatedCategories([
      'app.js',
      'a.png',
      'b.jpg',
      'index.html',
    ]);
    expect(categories.map(({id, count}) => [id, count])).toEqual([
      ['images', 2],
      ['html', 1],
      ['javascript', 1],
    ]);
  });

  it('returns nothing for an empty backpack', () => {
    expect(getPopulatedCategories([])).toEqual([]);
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

  it('sorts by category, then by name within a category', () => {
    expect(
      sortBackpackFiles(
        named('b.png', 'app.js', 'a.png', 'index.html'),
        'file-type'
      ).map(({fileName}) => fileName)
    ).toEqual(['a.png', 'b.png', 'index.html', 'app.js']);
  });

  it('leaves the input array untouched', () => {
    const original = [...files];
    sortBackpackFiles(files, 'name-desc');
    expect(files).toEqual(original);
  });
});
