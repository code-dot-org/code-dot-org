import sinon from 'sinon';
import {expect, assert} from '../../util/reconfiguredChai';
import {
  regenerateDefaultSpriteMetadata,
  createDefaultSpriteMetadata
} from '@cdo/apps/assetManagement/animationLibraryApi';
import testAnimationLibrary from './testAnimationLibrary.json';

describe('animationLibraryApi', () => {
  let fetchSpy;
  const defaultList = {
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
  const returnData = testAnimationLibrary;

  beforeEach(() => {
    fetchSpy = sinon.stub(window, 'fetch');
    fetchSpy
      .withArgs('/api/v1/animation-library/manifest/spritelab/en_us')
      .returns(
        Promise.resolve({
          ok: true,
          json: () => JSON.stringify(returnData)
        })
      );
  });

  afterEach(() => {
    fetchSpy.restore();
  });

  describe('regenerateDefaultSpriteMetadata', () => {
    it('sends data to middleware in POST', () => {
      fetchSpy
        .withArgs('/api/v1/animation-library/default-spritelab-metadata')
        .returns(Promise.resolve({ok: true}));

      return regenerateDefaultSpriteMetadata(defaultList).then(() => {
        expect(fetchSpy).calledWith(
          '/api/v1/animation-library/default-spritelab-metadata'
        );
        expect(fetchSpy).calledWithMatch(sinon.match.any, {method: 'POST'});
      });
    });

    it('throws error when bad response', () => {
      fetchSpy
        .withArgs('/api/v1/animation-library/default-spritelab-metadata')
        .returns(
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
    it('generates sprite metadata from animation library', () => {
      // Check that orderedKeys exists and contains two keys
      return createDefaultSpriteMetadata(defaultList).then(spriteMetadata => {
        expect(spriteMetadata).to.have.property('orderedKeys');
        expect(spriteMetadata.orderedKeys).to.have.length(2);

        // Check that keys are created in our UUID format
        const firstKey = spriteMetadata.orderedKeys[0];
        expect(firstKey).to.match(/^........-....-4...-....-............$/);

        //Check that propsByKey has an object that matches the first orderedKey and that the object the correct name,
        // a properly formatted sourceUrl, and the expected number of props.
        const firstSpriteProps = spriteMetadata.propsByKey[firstKey];
        expect(firstSpriteProps)
          .to.have.property('sourceUrl')
          .that.has.string('https://studio.code.org');
        expect(firstSpriteProps)
          .to.have.property('name')
          .that.equals('hippo');
        expect(Object.keys(firstSpriteProps)).to.have.length(8);
      });
    });
  });
});
