import ReactDOM from 'react-dom';

import {renderExpandableImages} from '@cdo/apps/templates/utils/expandableImages';

import {expect} from '../../../util/reconfiguredChai';

describe('expandableImages', () => {
  describe('renderExpandableImages', () => {
    let renderSpy;

    beforeEach(() => {
      renderSpy = jest.spyOn(ReactDOM, 'render').mockClear();
    });

    afterEach(() => {
      renderSpy.mockRestore();
    });

    const createExpandableImage = url => {
      const result = document.createElement('span');
      result.classList.add('expandable-image');
      result.dataset['url'] = url;
      return result;
    };

    it('creates an ImagePreview when it finds an expandable image', () => {
      const containerNode = document.createElement('div');
      const image = createExpandableImage('https://example.com/img.jpg');
      containerNode.appendChild(image);

      renderExpandableImages(containerNode);

      expect(renderSpy).to.have.been.calledOnce;

      const renderElement = renderSpy.mock.calls[0][0];
      expect(renderElement.props.url).to.equal('https://example.com/img.jpg');

      const renderContainer = renderSpy.mock.calls[0][1];
      expect(renderContainer).to.equal(image);
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
      expect(renderSpy).toHaveBeenCalledTimes(N);
    });
  });
});
