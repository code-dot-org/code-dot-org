import {toBlob} from 'html-to-image';

import {
  captureTreeImage,
  treeImageName,
} from '@cdo/apps/ailab/engine/helpers/treeImage';
import {getFontEmbedCss} from '@cdo/apps/util/imageExport/getFontEmbedCss';

jest.mock('html-to-image', () => ({toBlob: jest.fn()}));
jest.mock('@cdo/apps/util/imageExport/getFontEmbedCss', () => ({
  getFontEmbedCss: jest.fn(),
}));

const mockToBlob = jest.mocked(toBlob);

describe('treeImageName', () => {
  it.each([
    ['Titanic Passengers', 'titanic-passengers-tree'],
    ['My Data (2).csv', 'my-data-2-tree'],
  ])('names a tree from %s as %s', (datasetName, expected) => {
    expect(treeImageName(datasetName)).toBe(expected);
  });

  it.each([undefined, '数据.csv'])(
    'falls back to a generic name for %p',
    datasetName => {
      expect(treeImageName(datasetName)).toBe('decision-tree');
    }
  );
});

describe('captureTreeImage', () => {
  let tree: HTMLDivElement;
  let edge: SVGPathElement;

  beforeEach(() => {
    jest.mocked(getFontEmbedCss).mockResolvedValue('');
    tree = document.createElement('div');
    Object.defineProperties(tree, {
      offsetWidth: {value: 600},
      offsetHeight: {value: 300},
    });
    tree.innerHTML = '<svg><path /></svg>';
    edge = tree.querySelector('path')!;
    document.body.appendChild(tree);
  });

  afterEach(() => tree.remove());

  it('draws the whole tree with padding around it', async () => {
    const image = new Blob(['png']);
    mockToBlob.mockResolvedValue(image);

    await expect(captureTreeImage(tree)).resolves.toBe(image);

    expect(mockToBlob).toHaveBeenCalledWith(
      tree,
      expect.objectContaining({
        width: 648,
        height: 348,
        pixelRatio: 2,
        style: {transform: 'translate(24px, 24px)'},
      })
    );
  });

  it('leaves the edges styled as before, even when the capture fails', async () => {
    mockToBlob.mockImplementation(async () => {
      expect(edge.getAttribute('style')).not.toBeNull();
      throw new Error('decode failed');
    });

    await expect(captureTreeImage(tree)).rejects.toThrow('decode failed');

    expect(edge.hasAttribute('style')).toBe(false);
  });

  it('fails when html-to-image produces no image', async () => {
    mockToBlob.mockResolvedValue(null);

    await expect(captureTreeImage(tree)).rejects.toThrow();
  });
});
