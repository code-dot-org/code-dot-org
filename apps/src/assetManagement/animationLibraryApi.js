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

// Returns the list of default sprites in SpriteLab in English
export function getDefaultList() {
  return fetch('/api/v1/animation-library/default-spritelab').then(response =>
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
  return fetch('/api/v1/animation-library/default-spritelab-metadata').then(
    response => response.json()
  );
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
