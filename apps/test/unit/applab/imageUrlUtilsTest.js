import {resolveAppLabImagePath} from '@cdo/apps/applab/imageUrlUtils';
import {init} from '@cdo/apps/assetManagement/assetPrefix';
import * as redux from '@cdo/apps/redux';

describe('apps/src/applab/imageUrlUtils.js', () => {
  describe('resolveAppLabImagePath', () => {
    let reduxStub;

    beforeEach(() => {
      reduxStub = jest
        .spyOn(redux, 'getStore')
        .mockClear()
        .mockReturnValue({
          getState: () => ({
            level: {name: 'test-level'},
            pageConstants: {isCurriculumLevel: true},
          }),
        });
    });

    afterEach(() => {
      reduxStub.mockRestore();
    });

    it('returns an absolute https URL unchanged', () => {
      expect(resolveAppLabImagePath('https://example.com/image.png')).toBe(
        'https://example.com/image.png'
      );
    });

    it('preserves the query string and existing escapes of an absolute URL', () => {
      expect(
        resolveAppLabImagePath('https://example.com/test%20image.png?size=200')
      ).toBe('https://example.com/test%20image.png?size=200');
    });

    it('upgrades an absolute http URL to https', () => {
      expect(resolveAppLabImagePath('http://example.com/image.png')).toBe(
        'https://example.com/image.png'
      );

      expect(resolveAppLabImagePath('HTTP://example.com/image.png')).toBe(
        'https://example.com/image.png'
      );
    });

    it('only upgrades the scheme, not a later occurrence of http://', () => {
      expect(
        resolveAppLabImagePath('http://example.com/redirect?to=http://foo.com')
      ).toBe('https://example.com/redirect?to=http://foo.com');
    });

    it('resolves a project asset filename against the channel', () => {
      init({channel: 'test-channel'});
      expect(resolveAppLabImagePath('image.png')).toBe(
        '/v3/assets/test-channel/image.png'
      );
    });

    it('resolves a starter asset reference against the level', () => {
      expect(resolveAppLabImagePath('image://starter.png')).toBe(
        '/level_starter_assets/test-level/starter.png'
      );
    });
  });
});
