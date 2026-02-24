import {renderExpandableImages} from '@cdo/apps/templates/utils/expandableImages';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

jest.mock('@cdo/apps/util/createReactRoot', () => ({
  __esModule: true,
  createReactRoot: jest.fn(),
}));

describe('expandableImages', () => {
  describe('renderExpandableImages', () => {
    beforeEach(() => {
      createReactRoot.mockReset();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    const createExpandableImage = (url, alt) => {
      const result = document.createElement('span');
      result.classList.add('expandable-image');
      result.dataset['url'] = url;
      result.textContent = alt;
      return result;
    };

    it('creates an ImagePreview when it finds an expandable image', () => {
      const containerNode = document.createElement('div');
      const image = createExpandableImage(
        'https://example.com/img.jpg',
        'This is alt text'
      );
      containerNode.appendChild(image);

      renderExpandableImages(containerNode);

      expect(createReactRoot).toHaveBeenCalledTimes(1);

      const renderElement = createReactRoot.mock.calls[0][0];

      expect(renderElement.props.url).toBe('https://example.com/img.jpg');
      expect(renderElement.props.alt).toBe('This is alt text');

      const renderContainer = createReactRoot.mock.calls[0][1];
      expect(renderContainer).toBe(image);
    });

    it('supports multiple images in a single node', () => {
      const containerNode = document.createElement('div');
      const N = 5;

      for (let i = 0; i < N; i++) {
        containerNode.appendChild(
          createExpandableImage(`https://example.com/img-${i}.jpg`)
        );
      }

      renderExpandableImages(containerNode);
      expect(createReactRoot).toHaveBeenCalledTimes(N);
    });
  });
});
