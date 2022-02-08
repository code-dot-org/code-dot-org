import sinon from 'sinon';
import {expect, assert} from '../../util/reconfiguredChai';
import {
  regenerateDefaultSpriteMetadata,
  createDefaultSpriteMetadata,
  buildAnimationMetadata,
  buildMap,
  generateAnimationMetadataForFile,
  generateLevelAnimationsManifest
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

  const testAlphaMetadata = {
    name: 'testAlpha',
    frameCount: 1,
    frameSize: {x: 40, y: 40},
    looping: true,
    frameDelay: 2,
    aliases: ['fruit'],
    categories: []
  };

  const animationLibrary = testAnimationLibrary;
  const animationFiles = {key1: fileObject, key2: fileObject};

  beforeEach(() => {
    fetchSpy = sinon.stub(window, 'fetch');

    // Stubs getManifest
    fetchSpy
      .withArgs('/api/v1/animation-library/manifest/spritelab/en_us')
      .returns(
        Promise.resolve({
          ok: true,
          json: () => JSON.stringify(animationLibrary)
        })
      );

    // Stubs getLevelAnimationFiles
    fetchSpy
      .withArgs('/api/v1/animation-library/level-animations-files')
      .returns(
        Promise.resolve({
          ok: true,
          json: () => animationFiles
        })
      );

    // Stubs getAnimationLibraryFile
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
          'sourceSize',
          'aliases',
          'categories'
        ];
        expect(metadataKeys.length).to.equal(expectedKeys.length);
        expectedKeys.forEach(key => {
          expect(metadataKeys).to.include(key);
        });
      });
    });

    it('buildAnimationMetadata returns an object with metadata for each file', () => {
      return buildAnimationMetadata(animationFiles).then(metadata => {
        const expectedKeys = Object.keys(animationFiles);
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
    const animationMetadata = {
      beta: {
        fruit: ['apple', 'kiwi'],
        juicy: ['banana', 'blueberry', 'apple']
      },
      alpha: {
        fruit: ['apple', 'banana', 'kiwi'],
        delicious: ['banana', 'blueberry', 'apple']
      }
    };
    const getStandardizedContent = metadata => metadata.fruit;
    const normalizingFunction = item => item.replace('a', 'b');
    const testMap = buildMap(
      animationMetadata,
      getStandardizedContent,
      normalizingFunction
    );

    it('applies normalizing function if provided', () => {
      const keys = Object.keys(testMap);
      expect(keys).to.contain('bpple');
      expect(keys).to.contain('bbnana');
      expect(keys).to.not.contain('apple');
      expect(keys).to.not.contain('banana');
    });

    it('values in returned object are sorted', () => {
      expect(testMap.bpple).to.eql(['alpha', 'beta']);
    });
  });

  describe('generateLevelAnimationsManifest', () => {
    it('returned object contains comment, metadata, categories, and aliases', () => {
      return generateLevelAnimationsManifest().then(manifest => {
        const manifestObj = JSON.parse(manifest);
        const manifestKeys = Object.keys(manifestObj);
        const expectedKeys = ['//', 'metadata', 'categories', 'aliases'];
        expect(manifestKeys).to.eql(expectedKeys);
      });
    });

    it('metadata in returned object does not contain aliases', () => {
      return generateLevelAnimationsManifest().then(manifest => {
        const manifestObj = JSON.parse(manifest);
        expect(manifestObj.metadata.key1.aliases).to.be.undefined;
      });
    });
  });
});
