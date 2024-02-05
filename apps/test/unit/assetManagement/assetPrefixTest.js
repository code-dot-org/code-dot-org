import sinon from 'sinon';
import * as redux from '@cdo/apps/redux';
import {init, fixPath} from '@cdo/apps/assetManagement/assetPrefix';
import {expect} from '../../util/reconfiguredChai';

describe('apps/src/assetManagement/assetPrefix.js', () => {
  describe('fixPath', () => {
    let reduxStub, result;

    beforeEach(() => {
      reduxStub = sinon.stub(redux, 'getStore').returns({
        getState: () => ({
          level: {
            name: 'test-level',
          },
          pageConstants: {
            isCurriculumLevel: true,
          },
        }),
      });
    });

    afterEach(() => {
      reduxStub.restore();
    });

    it('should route an absolute URL through the MEDIA_PROXY', () => {
      result = fixPath('http://example.com/test%20image.png');
      expect(result).to.equal(
        `//${location.host}/media?u=http%3A%2F%2Fexample.com%2Ftest%2520image.png`
      );

      result = fixPath('https://example.com/test%20image.png');
      expect(result).to.equal(
        `//${location.host}/media?u=https%3A%2F%2Fexample.com%2Ftest%2520image.png`
      );
    });

    it('should not route known absolute URLs through the MEDIA_PROXY', () => {
      result = fixPath('https://curriculum.code.org/test-image.png');
      expect(result).to.equal('https://curriculum.code.org/test-image.png');

      result = fixPath('https://images.code.org/test-image.png');
      expect(result).to.equal('https://images.code.org/test-image.png');
    });

    it('should return the default image when the filename is empty', () => {
      result = fixPath();
      expect(result).to.equal('/blockly/media/1x1.gif');

      result = fixPath('');
      expect(result).to.equal('/blockly/media/1x1.gif');

      result = fixPath(null);
      expect(result).to.equal('/blockly/media/1x1.gif');
    });

    it('should replace sound:// prefix with soundPathPrefix', () => {
      const result = fixPath('sound://test-sound.wav');
      expect(result).to.equal('/api/v1/sound-library/test-sound.wav');
    });

    it('should replace starter:// prefix with starterAssetPathPrefix', () => {
      const result = fixPath('image://test-starter-image.png');
      expect(result).to.equal(
        '/level_starter_assets/test-level/test-starter-image.png'
      );
    });

    it('should prepend assetPathPrefix and channelId when the filename is relative', () => {
      init({channel: 'test-channel'});
      const result = fixPath('image.png');
      expect(result).to.equal(`/v3/assets/test-channel/image.png`);
    });

    it('should not prepend assetPathPrefix or channelId when the filename is relative and channelId is not set', () => {
      const result = fixPath('//images.code.org/test-image.png');
      expect(result).to.equal('//images.code.org/test-image.png');
    });
  });
});
