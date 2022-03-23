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

export function generateAnimationMetadataForFile(fileObject) {
  const json = fileObject.json;
  const png = fileObject.png;
  return getAnimationLibraryFile(json.key)
    .then(metadata => {
      // Metadata contains name, frameCount, frameSize, looping, frameDelay
      let combinedMetadata = {
        ...metadata,
        jsonLastModified: json.last_modified,
        pngLastModified: png.last_modified,
        version: png.version_id,
        sourceUrl: `/api/v1/animation-library/level_animations/${
          png.version_id
        }/${metadata.name}.png`,
        sourceSize: png.source_size
      };
      return Promise.resolve(combinedMetadata);
    })
    .catch(err => Promise.reject(err));
}

export function buildAnimationMetadata(files) {
  let animationMetadataByName = {};
  let resolvedPromisesArray = [];
  for (const [fileKey, fileObject] of Object.entries(files)) {
    resolvedPromisesArray.push(
      generateAnimationMetadataForFile(fileObject)
        .then(metadata => {
          animationMetadataByName[fileKey] = metadata;
        })
        .catch(err => Promise.reject(err))
    );
  }
  return Promise.all(resolvedPromisesArray).then(() => animationMetadataByName);
}

export function buildMap(
  animationMetadata,
  getStandardizedContent,
  normalizingFunction
) {
  let contentMap = {};
  for (const [key, metadata] of Object.entries(animationMetadata)) {
    let formattedArray = getStandardizedContent(metadata);
    formattedArray.map(item => {
      let content = normalizingFunction ? normalizingFunction(item) : item;
      if (!contentMap[content]) {
        contentMap[content] = [];
      }
      contentMap[content].push(key);
    });
  }

  // After map is populated, transform values in sorted arrays
  for (const key of Object.keys(contentMap)) {
    contentMap[key] = [...contentMap[key]].sort();
  }
  return contentMap;
}

function getStandardizedAliases(metadata) {
  const formattedAliases = metadata.aliases?.map(alias => {
    alias.toLowerCase();
  });
  // Include the name of the animation as an alias
  return [metadata.name.toLowerCase(), ...formattedAliases];
}

function getStandardizedCategories(metadata) {
  // If the animation doesn't have a category, place it in a section for
  // level-specific/hidden-from-library animations.
  return metadata.categories || ['level_animations'];
}

// Generates the json animation manifest for the level_animations folder
export function generateLevelAnimationsManifest() {
  return getLevelAnimationsFiles().then(files => {
    return buildAnimationMetadata(files).then(animationMetadata => {
      let aliasMap = buildMap(animationMetadata, getStandardizedAliases, null);

      let categoryMap = buildMap(
        animationMetadata,
        getStandardizedCategories,
        category => category.replace(' ', '_')
      );

      let metadataNoAliases = {...animationMetadata};

      Object.values(metadataNoAliases).map(metadata => {
        delete metadata.aliases;
      });

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
      .catch(err => Promise.reject(err));
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
    .catch(err => Promise.reject(err));
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
    .catch(err => Promise.reject(err));
}

export function getLevelAnimationsFiles() {
  return fetch('/api/v1/animation-library/level-animations-files').then(
    response => response.json()
  );
}
