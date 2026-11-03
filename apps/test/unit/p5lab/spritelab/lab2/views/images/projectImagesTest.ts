import {listProjectImages} from '@cdo/apps/p5lab/spritelab/lab2/views/images/projectImages';

const thumbs: Record<string, string> = {};
jest.mock('@cdo/apps/p5lab/spritelab/lab2/imageTrim', () => ({
  getImageThumbnail: (name: string) => thumbs[name],
}));

describe('listProjectImages', () => {
  it('lists each image with its kind, subject, picture and thumbnail', () => {
    thumbs['Sprite 1'] = 'data:thumb';
    const images = listProjectImages({
      orderedKeys: ['a', 'b', 'c', 'd'],
      propsByKey: {
        a: {name: 'Sprite 1', categories: [], sourceUrl: 'a.png'},
        b: {
          name: 'Key',
          categories: [],
          dataURI: 'data:b',
          generation: {
            prompt: 'a key',
            imageType: 'sprite',
            subject: 'object',
            style: 'pixel',
            seed: 1,
          },
        },
        c: {name: 'Grass', categories: ['blocks'], sourceUrl: 'c.png'},
        d: undefined,
      },
    });
    expect(images.map(image => image.key)).toEqual(['a', 'b', 'c']);
    const [sprite, key, block] = images;
    expect(sprite).toMatchObject({
      imageType: 'sprite',
      thumb: 'data:thumb',
      src: 'a.png',
      pixelated: false,
    });
    // The thumbnail falls back to the picture itself.
    expect(key).toMatchObject({
      imageType: 'sprite',
      subject: 'object',
      thumb: 'data:b',
    });
    expect(block).toMatchObject({imageType: 'block', subject: undefined});
  });

  it('reads the subject stored on the image before the generation record', () => {
    const [image] = listProjectImages({
      orderedKeys: ['a'],
      propsByKey: {
        a: {
          name: 'Sprite 1',
          categories: [],
          subject: 'object',
          generation: {
            prompt: 'x',
            imageType: 'sprite',
            subject: 'character',
            style: 'pixel',
            seed: 1,
          },
        },
      },
    });
    expect(image.subject).toBe('object');
  });

  it('marks pixel art and carries a character set as a sheet', () => {
    const poses = {'stand-right': {start: 0, count: 2, frameDelay: 6}};
    const [image] = listProjectImages({
      orderedKeys: ['a'],
      propsByKey: {
        a: {
          name: 'Hero',
          categories: [],
          sourceUrl: 'hero.png',
          pixelGridSize: 1,
          frameSize: {x: 32, y: 32},
          poses,
        },
      },
    });
    expect(image.pixelated).toBe(true);
    expect(image.sheet).toEqual({
      src: 'hero.png',
      frameSize: {x: 32, y: 32},
      poses,
    });
  });

  it('names an image with no name', () => {
    const [image] = listProjectImages({
      orderedKeys: ['a'],
      propsByKey: {a: {categories: []}},
    });
    expect(image.name).toBe('image');
  });
});
