import {createUuid} from '@cdo/apps/utils';

export const UploadType = {
  SPRITE: 'Sprite',
  METADATA: 'Metadata'
};

/* Returns the animation manifest of either GameLab or SpriteLab in the specified locale
 * @param appType {String} "gamelab" or "spritelab"
 * @param locale {String} language locale, defaults to 'en_us'
 */
export function getManifest(appType, locale = 'en_us') {
  return fetch(`/api/v1/animation-library/manifest/${appType}/${locale}`).then(
    response => response.json()
  );
}

/* Returns the metadata for a specific animation library file
 * @param filename {String} metadata filename
 */
export function getAnimationLibraryFile(filename) {
  return fetch(`/api/v1/animation-library/${filename}`).then(response =>
    response.json()
  );
}

// Returns the list of default sprites in SpriteLab in English
export function getDefaultList() {
  return fetch(`/api/v1/animation-library/default-spritelab`).then(response =>
    response.json()
  );
}

/* Returns the list of default sprites in SpriteLab in English
 * @param listData {Object} JSON object to upload
 */
export function updateDefaultList(listData) {
  return fetch(`/api/v1/animation-library/default-spritelab`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(listData)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(
          `Default List Upload Error(${response.status}: ${
            response.statusText
          })`
        );
      }
      return Promise.resolve();
    })
    .catch(err => {
      return Promise.reject(err);
    });
}

// Returns the metadata of the list of default sprites in SpriteLab in English
export function getDefaultListMetadata() {
  return fetch('/api/v1/animation-library/default-spritelab-metadata')
    .then(response => response.json())
    .catch(err => {
      return Promise.reject(err);
    });
}

export function createDefaultSpriteMetadata(listData) {
  let orderedKeys = [];
  let propsByKey = {};
  return getManifest('spritelab').then(manifest => {
    const animations = JSON.parse(manifest)['metadata'];
    for (let sprite of listData.default_sprites) {
      const {
        sourceUrl,
        frameSize,
        frameCount,
        looping,
        frameDelay,
        version,
        categories
      } = animations[sprite.key];
      const props = {
        name: sprite.name,
        sourceUrl: `https://studio.code.org${sourceUrl}`,
        frameSize,
        frameCount,
        looping,
        frameDelay,
        version,
        categories
      };
      const key = createUuid();
      orderedKeys.push(key);
      propsByKey[key] = props;
    }
    return {orderedKeys, propsByKey};
  });
}

export function buildAnimationMetadata(files) {
  let animationMetadataByName = {};
  let resolvedPromisesArray = [];
  for (const [fileKey, fileObject] of Object.entries(files)) {
    let json = fileObject['json'];
    let png = fileObject['png'];
    resolvedPromisesArray.push(
      getAnimationLibraryFile(json.key)
        .then(metadata => {
          // Metadata contains name, frameCount, frameSize, looping, frameDelay
          let combinedMetadata = metadata;
          combinedMetadata['jsonLastModified'] = json.last_modified;
          combinedMetadata['pngLastModified'] = png.last_modified;
          combinedMetadata['version'] = png.version_id;
          combinedMetadata[
            'sourceUrl'
          ] = `/api/v1/animation-library/level_animations/${png.version_id}/${
            metadata.name
          }.png`;
          combinedMetadata['sourceSize'] = png.source_size;
          animationMetadataByName[fileKey] = combinedMetadata;
          return Promise.resolve();
        })
        .catch(err => {
          return Promise.reject(err);
        })
    );
  }
  return Promise.all(resolvedPromisesArray).then(() => {
    return animationMetadataByName;
  });
}

export function buildAliasMap(animationMetadata) {
  let aliasMap = {};

  for (const [key, metadata] of Object.entries(animationMetadata)) {
    let aliases = [metadata['name'].toLowerCase()];
    if (metadata['aliases']) {
      metadata['aliases'].map(alias => {
        aliases.push(alias.toLowerCase());
      });
    }
    aliases.map(alias => {
      //Push name into target array, deduplicate, and sort
      let updatedMap = {...aliasMap};
      let addedSet = new Set(updatedMap[alias]);
      addedSet.add(key);
      aliasMap[alias] = [...addedSet].sort();
    });
  }
  return aliasMap;
}

export function buildCategoryMap(animationMetadata) {
  let categoryMap = {};

  for (const [key, metadata] of Object.entries(animationMetadata)) {
    let categories = metadata['categories'];
    // If the animation doesn't have a category, place it in a section for
    // level-specific/hidden-from-library animations.
    if (!categories) {
      categories = ['level_animations'];
    }
    categories.map(category => {
      let normalizedCategory = category.replace(' ', '_');
      //Push name into target array, deduplicate, and sort
      let updatedMap = {...categoryMap};
      let addedSet = new Set(updatedMap[category]);
      addedSet.add(key);
      categoryMap[normalizedCategory] = [...addedSet].sort();
    });
  }
  return categoryMap;
}

// Generates the json animation manifest for the level_animations folder
export function generateLevelAnimationsManifest() {
  return getLevelAnimationsFilenames().then(files => {
    return buildAnimationMetadata(files).then(animationMetadata => {
      let aliasMap = buildAliasMap(animationMetadata);

      let categoryMap = buildCategoryMap(animationMetadata);

      let metadataNoAliases = {...animationMetadata};

      for (const metadata of Object.values(metadataNoAliases)) {
        delete metadata.aliases;
      }

      let manifestJson = {
        '//': [
          'Animation Library Manifest',
          'GENERATED FILE: DO NOT MODIFY DIRECTLY'
        ],
        metadata: metadataNoAliases,

        categories: categoryMap,

        aliases: aliasMap
      };

      return JSON.stringify(manifestJson);
    });
  });
}

// Regenerates the metadata for the default list of sprites in SpriteLab
export function regenerateDefaultSpriteMetadata(listData) {
  return createDefaultSpriteMetadata(listData).then(defaultMetadata => {
    return fetch(`/api/v1/animation-library/default-spritelab-metadata`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(defaultMetadata)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(
            `Default Sprite Metadata Upload Error(${response.status}: ${
              response.statusText
            })`
          );
        }
        return Promise.resolve();
      })
      .catch(err => {
        return Promise.reject(err);
      });
  });
}

/* Uploads the given sprite to the animation library at the specified path. On success
  and error calls the associated function
 * @param destination {String} path to sprite location in the animation-library folder
 * @param imageData {Blob} sprite image data to upload
 * @returns {Promise} resolves if successful upload, rejects otherwise
 */
export function uploadSpriteToAnimationLibrary(destination, imageData) {
  return fetch(`/api/v1/animation-library` + destination, {
    method: 'POST',
    headers: {
      'Content-Type': 'image/png'
    },
    body: imageData
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(
          `Sprite Upload Error(${response.status}: ${response.statusText})`
        );
      }
      return Promise.resolve();
    })
    .catch(err => {
      return Promise.reject(err);
    });
}

/* Uploads the given JSON of sprite metadata to the animation library at the specified path. On success
  and error calls the associated function
 * @param destination {String} path to metadata location in the animation-library folder
 * @param jsonData {String} JSON object of metadata to upload
 * @returns {Promise} resolves if successful upload, rejects otherwise
 */
export function uploadMetadataToAnimationLibrary(destination, jsonData) {
  return fetch(`/api/v1/animation-library` + destination, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: jsonData
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(
          `Metadata Upload Error(${response.status}: ${response.statusText})`
        );
      }
      return Promise.resolve();
    })
    .catch(err => {
      return Promise.reject(err);
    });
}

export function getLevelAnimationsFilenames() {
  return fetch('/api/v1/animation-library/level-animations-filenames').then(
    response => response.json()
  );
}
