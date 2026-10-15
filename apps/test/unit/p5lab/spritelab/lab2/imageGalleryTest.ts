import {
  galleryOrder,
  imageTypeFromCategories,
} from '@cdo/apps/p5lab/spritelab/lab2/imageGallery';

describe('imageTypeFromCategories', () => {
  it('maps categories to image types, defaulting to sprite', () => {
    expect(imageTypeFromCategories(['backgrounds'])).toBe('background');
    expect(imageTypeFromCategories(['blocks'])).toBe('block');
    expect(imageTypeFromCategories(['other'])).toBe('sprite');
    expect(imageTypeFromCategories([])).toBe('sprite');
    expect(imageTypeFromCategories(undefined)).toBe('sprite');
  });
});

describe('galleryOrder', () => {
  type Item = {name: string; type: 'background' | 'sprite' | 'block'};
  const typeOf = (i: Item) => i.type;

  it('groups backgrounds, then sprites, then blocks', () => {
    const items: Item[] = [
      {name: 'cat', type: 'sprite'},
      {name: 'brick', type: 'block'},
      {name: 'forest', type: 'background'},
    ];
    expect(galleryOrder(items, typeOf).map(i => i.name)).toEqual([
      'forest',
      'cat',
      'brick',
    ]);
  });

  it('keeps the stored order within each group', () => {
    const items: Item[] = [
      {name: 'cat', type: 'sprite'},
      {name: 'forest', type: 'background'},
      {name: 'dog', type: 'sprite'},
      {name: 'city', type: 'background'},
    ];
    expect(galleryOrder(items, typeOf).map(i => i.name)).toEqual([
      'forest',
      'city',
      'cat',
      'dog',
    ]);
  });

  it('does not mutate its input', () => {
    const items: Item[] = [
      {name: 'brick', type: 'block'},
      {name: 'forest', type: 'background'},
    ];
    const copy = [...items];
    galleryOrder(items, typeOf);
    expect(items).toEqual(copy);
  });
});
