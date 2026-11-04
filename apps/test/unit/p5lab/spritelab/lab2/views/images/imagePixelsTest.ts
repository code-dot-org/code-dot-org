import {currentPixels} from '@cdo/apps/p5lab/spritelab/lab2/views/images/imagePixels';

const toImage = jest.fn();
jest.mock('@cdo/apps/imageUtils', () => ({
  toImage: (...args: unknown[]) => toImage(...args),
  blobToDataURI: (blob: Blob, done: (uri: string) => void) =>
    done(`data:from-blob-${blob.size}`),
}));
const upscaleImageNearest = jest.fn();
jest.mock('@cdo/apps/pixelEditor/pixelArt', () => ({
  NATIVE_PIXEL_GRID: 1,
  upscaleImageNearest: (...args: unknown[]) => upscaleImageNearest(...args),
}));
const httpGet = jest.fn();
jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {get: (...args: unknown[]) => httpGet(...args)},
}));

describe('currentPixels', () => {
  beforeEach(() => {
    toImage.mockReset();
    upscaleImageNearest.mockReset();
    httpGet.mockReset();
  });

  it('is null for an image with no pixels', async () => {
    expect(await currentPixels({name: 'Sprite 1'})).toBeNull();
  });

  it('passes a smooth picture through as it is', async () => {
    expect(await currentPixels({dataURI: 'data:smooth'})).toBe('data:smooth');
  });

  it('fetches a picture that has only a file, by its URL', async () => {
    httpGet.mockResolvedValue({blob: async () => new Blob(['abc'])});
    expect(await currentPixels({sourceUrl: '/v3/assets/chan/a.png'})).toBe(
      'data:from-blob-3'
    );
    expect(httpGet).toHaveBeenCalledWith('/v3/assets/chan/a.png');
  });

  it('scales pixel art back up to the size the model works at', async () => {
    upscaleImageNearest.mockResolvedValue({dataURI: 'data:big', factor: 32});
    expect(await currentPixels({dataURI: 'data:small', pixelGridSize: 1})).toBe(
      'data:big'
    );
    const [, factorFor] = upscaleImageNearest.mock.calls[0] as [
      string,
      (w: number, h: number) => number
    ];
    expect(factorFor(32, 32)).toBe(32);
  });

  it("sends only a character set's standing frame", async () => {
    const image = document.createElement('img');
    Object.defineProperty(image, 'naturalWidth', {value: 160});
    toImage.mockResolvedValue(image);
    const drawImage = jest.fn();
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      (() =>
        ({
          drawImage,
        } as unknown as CanvasRenderingContext2D)) as unknown as typeof HTMLCanvasElement.prototype.getContext
    );
    jest
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue('data:standing');
    expect(
      await currentPixels({
        dataURI: 'data:strip',
        frameSize: {x: 32, y: 32},
        poses: {'stand-right': {start: 0, count: 2, frameDelay: 20}},
      })
    ).toBe('data:standing');
    // The standing frame is the last of the stand-right range: index 1.
    expect(drawImage).toHaveBeenCalledWith(image, 32, 0, 32, 32, 0, 0, 32, 32);
    jest.restoreAllMocks();
  });
});
