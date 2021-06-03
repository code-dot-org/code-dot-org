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
