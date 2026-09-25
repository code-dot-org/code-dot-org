import {downscaleImagesForExport} from '@cdo/apps/sketchlab/reactFlow/utils/downscaleImagesForExport';

interface ImageDimensions {
  layoutWidth: number;
  layoutHeight: number;
  naturalWidth: number;
  naturalHeight: number;
  complete?: boolean;
}

// jsdom lays nothing out and loads nothing, so the layout size, the decoded
// size and the load state all have to be declared.
const addImage = (src: string, dimensions: ImageDimensions) => {
  const image = document.createElement('img');
  image.src = src;
  const {
    layoutWidth,
    layoutHeight,
    naturalWidth,
    naturalHeight,
    complete = true,
  } = dimensions;
  Object.defineProperties(image, {
    offsetWidth: {value: layoutWidth},
    offsetHeight: {value: layoutHeight},
    naturalWidth: {value: naturalWidth},
    naturalHeight: {value: naturalHeight},
    complete: {value: complete},
  });
  document.body.appendChild(image);
  return image;
};

const PHOTO = {
  layoutWidth: 300,
  layoutHeight: 200,
  naturalWidth: 4000,
  naturalHeight: 3000,
};

describe('downscaleImagesForExport', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('replaces an image larger than the export will show', () => {
    const image = addImage('/v3/assets/channel/photo.png', PHOTO);

    downscaleImagesForExport(document.body, 1);

    expect(image.src.startsWith('data:image/png')).toBe(true);
  });

  it('restores the original sources', () => {
    const source = 'http://localhost-studio.code.org/v3/assets/channel/a.png';
    const image = addImage(source, PHOTO);

    const restore = downscaleImagesForExport(document.body, 1);
    restore();

    expect(image.src).toBe(source);
  });

  // The 4:3 photo sits in a 3:2 box, so it fits to the box height.
  it('draws at the exported size, keeping the source aspect ratio', () => {
    const image = addImage('/v3/assets/channel/photo.png', PHOTO);
    const drawImage = jest.fn();
    // `as never` sidesteps the overloaded return type of getContext.
    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({drawImage} as never);

    downscaleImagesForExport(document.body, 2);

    expect(drawImage).toHaveBeenCalledWith(image, 0, 0, 533, 400);
  });

  it('leaves an image whose longer side already fits alone', () => {
    const source = '/v3/assets/channel/wide.png';
    const image = addImage(source, {
      layoutWidth: 300,
      layoutHeight: 200,
      naturalWidth: 300,
      naturalHeight: 100,
    });

    downscaleImagesForExport(document.body, 1);

    expect(image.src).toContain(source);
  });

  it('leaves an image already smaller than the export alone', () => {
    const source = '/v3/assets/channel/icon.png';
    const image = addImage(source, {
      layoutWidth: 300,
      layoutHeight: 200,
      naturalWidth: 300,
      naturalHeight: 200,
    });

    downscaleImagesForExport(document.body, 1);

    expect(image.src).toContain(source);
  });

  it('leaves an image that has not loaded alone', () => {
    const source = '/v3/assets/channel/pending.png';
    const image = addImage(source, {
      layoutWidth: 300,
      layoutHeight: 200,
      naturalWidth: 0,
      naturalHeight: 0,
    });

    downscaleImagesForExport(document.body, 1);

    expect(image.src).toContain(source);
  });

  it('leaves an image whose size is known but pixels are still loading alone', () => {
    const source = '/v3/assets/channel/downloading.png';
    const image = addImage(source, {...PHOTO, complete: false});

    downscaleImagesForExport(document.body, 1);

    expect(image.src).toContain(source);
  });

  it('re-encodes a jpeg source as jpeg', () => {
    const image = addImage('/v3/assets/channel/photo.jpg', PHOTO);

    downscaleImagesForExport(document.body, 1);

    expect(image.src.startsWith('data:image/jpeg')).toBe(true);
  });

  it('keeps the original source when the canvas is tainted', () => {
    const source = 'https://other.example/photo.png';
    const image = addImage(source, PHOTO);
    jest
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockImplementation(() => {
        throw new Error('SecurityError');
      });

    const restore = downscaleImagesForExport(document.body, 1);

    expect(image.src).toBe(source);
    expect(() => restore()).not.toThrow();
  });
});
