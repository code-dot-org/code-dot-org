import sinon from 'sinon';
import {expect, assert} from '../../util/reconfiguredChai';
import {
  regenerateDefaultSpriteMetadata,
  createDefaultSpriteMetadata,
  buildAnimationMetadata,
  buildMap,
  generateAnimationMetadataForFile
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

  describe('generateAnimationMetadataForFile', () => {
    const testAlphaMetadata = {
      name: 'testAlpha',
      frameCount: 1,
      frameSize: {x: 40, y: 40},
      looping: true,
      frameDelay: 2
    };

    const fileObject = {
      json: {
        key: 'testAlpha.json',
        last_modified: '12152021'
      },
      png: {
        key: 'testAlpha.png',
        last_modified: '12152021',
        version: '123',
        source_size: 456
      }
    };

    beforeEach(() => {
      fetchSpy.withArgs('/api/v1/animation-library/testAlpha.json').returns(
        Promise.resolve({
          ok: true,
          json: () => testAlphaMetadata
        })
      );
    });

    afterEach(() => {
      fetchSpy.restore();
    });

    it('returns a promise with an object that contains the expected keys', () => {
      return generateAnimationMetadataForFile(fileObject).then(metadata => {
        const metadataKeys = Object.keys(metadata);
        const expectedKeys = [
          'name',
          'frameCount',
          'frameSize',
          'looping',
          'frameDelay',
          'jsonLastModified',
          'pngLastModified',
          'version',
          'sourceUrl',
          'sourceSize'
        ];
        expect(metadataKeys.length).to.equal(expectedKeys.length);
        expectedKeys.forEach(key => {
          expect(metadataKeys).to.include(key);
        });
      });
    });

    it('buildAnimationMetadata returns an object with metadata for each file', () => {
      const files = {key1: fileObject, key2: fileObject};

      return buildAnimationMetadata(files).then(metadata => {
        // expect metadata keys to be files
        const expectedKeys = Object.keys(files);
        const metadataKeys = Object.keys(metadata);
        expect(metadataKeys.length).to.equal(expectedKeys.length);
        expectedKeys.forEach(key => {
          expect(metadataKeys).to.include(key);
        });

        return generateAnimationMetadataForFile(fileObject).then(
          animationData => {
            expect(metadata['key1']).to.deep.equal(animationData);
          }
        );
      });
    });
  });

  describe('buildMap', () => {
    it('applies normalizing function if provided', () => {
      const normalizingFunction = item => item.replace('a', 'b');
      const getStandardizedContent = metadata => metadata.fruit;
      const animationMetadata = {
        alpha: {
          fruit: ['apple', 'banana', 'kiwi'],
          delicious: ['banana', 'blueberry', 'apple']
        }
      };
      const testMap = buildMap(
        animationMetadata,
        getStandardizedContent,
        normalizingFunction
      );
      expect(testMap.fruit).to.contain('bpple');
      // expect(testMap.alpha).to.contain('bbnbnb');
      // expect(testMap.alpha).to.not.contain('apple');
      // expect(testMap.alpha).to.not.contain('banana');
    });

    it('duplicated values are removed from returned object values', () => {});

    it('values in returned object are sorted', () => {});
  });

  describe('generateLevelAnimationsManifest', () => {
    it('returned object contains comment, metadata, categories, and aliases', () => {});

    it('metadata in returned object does not contain aliases', () => {});
  });
});
