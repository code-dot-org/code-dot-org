import {init, fixPath} from '@cdo/apps/assetManagement/assetPrefix';
import * as redux from '@cdo/apps/redux';

describe('apps/src/assetManagement/assetPrefix.js', () => {
  describe('fixPath', () => {
    let reduxStub, result;

    beforeEach(() => {
      reduxStub = jest
        .spyOn(redux, 'getStore')
        .mockClear()
        .mockReturnValue({
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
      reduxStub.mockRestore();
    });

    it('should route an absolute URL through the MEDIA_PROXY', () => {
      result = fixPath('http://example.com/test%20image.png');
      expect(result).toBe(
        `//${location.host}/media?u=http%3A%2F%2Fexample.com%2Ftest%2520image.png`
      );

      result = fixPath('https://example.com/test%20image.png');
      expect(result).toBe(
        `//${location.host}/media?u=https%3A%2F%2Fexample.com%2Ftest%2520image.png`
      );
    });

    it('should not route known absolute URLs through the MEDIA_PROXY', () => {
      result = fixPath('https://curriculum.code.org/test-image.png');
      expect(result).toBe('https://curriculum.code.org/test-image.png');

      result = fixPath('https://images.code.org/test-image.png');
      expect(result).toBe('https://images.code.org/test-image.png');
    });

    it('should return the default image when the filename is empty', () => {
      result = fixPath();
      expect(result).toBe('/blockly/media/1x1.gif');

      result = fixPath('');
      expect(result).toBe('/blockly/media/1x1.gif');

      result = fixPath(null);
      expect(result).toBe('/blockly/media/1x1.gif');
    });

    it('should replace sound:// prefix with soundPathPrefix', () => {
      const result = fixPath('sound://test-sound.wav');
      expect(result).toBe('/api/v1/sound-library/test-sound.wav');
    });

    it('should replace starter:// prefix with starterAssetPathPrefix', () => {
      const result = fixPath('image://test-starter-image.png');
      expect(result).toBe(
        '/level_starter_assets/test-level/test-starter-image.png'
      );
    });

    it('should prepend assetPathPrefix and channelId when the filename is relative', () => {
      init({channel: 'test-channel'});
      const result = fixPath('image.png');
      expect(result).toBe(`/v3/assets/test-channel/image.png`);
    });

    it('should not prepend assetPathPrefix or channelId when the filename is relative and channelId is not set', () => {
      const result = fixPath('//images.code.org/test-image.png');
      expect(result).toBe('//images.code.org/test-image.png');
    });
  });
});
