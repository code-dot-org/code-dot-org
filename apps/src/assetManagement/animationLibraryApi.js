import spriteManifest from '@cdo/apps/p5lab/spritelab/spriteCostumeLibrary.json';
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

/* Regenerates the animation JSON list of the sprites in SpriteLab
 */
export function regenerateDefaultJSON() {
  getDefaultList().then(json => {
    let orderedKeys = [];
    let propsByKey = {};
    let parsed = spriteManifest;
    let animations = parsed['metadata'];
    for (let sprite of json.default_sprites) {
      let animation_metadata = animations[sprite.key];
      let props = {};
      props['name'] = sprite.name;
      props['sourceUrl'] = `https://studio.code.org${
        animation_metadata['sourceUrl']
      }`;
      props['frameSize'] = animation_metadata['frameSize'];
      props['frameCount'] = animation_metadata['frameCount'];
      props['looping'] = animation_metadata['looping'];
      props['frameDelay'] = animation_metadata['frameDelay'];
      props['version'] = animation_metadata['version'];
      props['categories'] = animation_metadata['categories'];
      let key = createUuid();
      orderedKeys.push(key);
      propsByKey[key] = props;
    }
    let data = JSON.stringify({
      orderedKeys: orderedKeys,
      propsByKey: propsByKey
    });
    return fetch(`/api/v1/animation-library/default-spritelab-json`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: data
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(
            `Default Sprite JSON Upload Error(${response.status}: ${
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
