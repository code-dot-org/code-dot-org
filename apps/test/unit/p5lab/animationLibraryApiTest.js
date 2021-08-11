import sinon from 'sinon';
import {expect, assert} from '../../util/reconfiguredChai';
import {regenerateDefaultSpriteMetadata} from '@cdo/apps/assetManagement/animationLibraryApi';

describe('animationLibraryApi', () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = sinon.stub(window, 'fetch');
  });

  afterEach(() => {
    fetchSpy.restore();
  });

  describe('regenerateDefaultSpriteMetadata', () => {
    let defaultList = {
      default_sprites: [
        {
          name: 'hippo',
          key: 'category_animals/hippo'
        },
        {
          name: 'wheat',
          key: 'category_video_games/wheat'
        }
      ]
    };

    it('sends data to middleware in POST', () => {
      fetchSpy.returns(Promise.resolve({ok: true}));

      return regenerateDefaultSpriteMetadata(defaultList).then(() => {
        expect(fetchSpy).calledWith(
          '/api/v1/animation-library/default-spritelab-metadata'
        );
        expect(fetchSpy).calledWithMatch(sinon.match.any, {method: 'POST'});
      });
    });

    it('throws error when bad response', () => {
      fetchSpy.returns(
        Promise.resolve({
          ok: false,
          status: '000',
          statusText: 'Test error message'
        })
      );

      return regenerateDefaultSpriteMetadata(defaultList).then(
        () => {
          assert.fail('Expected an error message');
        },
        error => {
          assert.equal(
            error.message,
            'Default Sprite Metadata Upload Error(000: Test error message)'
          );
        }
      );
    });
  });

  describe('createDefaultSpriteMetadata', () => {
    // check that props were translated
    // check that UUID was created

    it('generates sprite props and sends to middleware', () => {});

    it('throws error when bad response', () => {});
  });
});
