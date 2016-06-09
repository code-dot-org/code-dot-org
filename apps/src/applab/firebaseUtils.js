/* global Applab */

import Firebase from 'firebase';
let databaseCache = {};

export function getDatabase(channelId) {
  let db = databaseCache[channelId];
  if (!db) {
    if (!Applab.firebaseName) {
      throw new Error("Error connecting to Firebase: Firebase name not specified");
    }
    if (!Applab.firebaseAuthToken) {
      throw new Error("Error connecting to Firebase: Firebase auth token not specified");
    }
    let base_url = `https://${Applab.firebaseName}.firebaseio.com`;
    db = new Firebase(`${base_url}/v3/channels/${channelId}`);
    if (Applab.firebaseAuthToken) {
      db.authWithCustomToken(Applab.firebaseAuthToken, (err, user) => {
        if (err) {
          throw new Error(`error authenticating to Firebase: ${err}`);
        } else {
          Applab.firebaseUserId = user.uid;
        }
      });
    }
    databaseCache[channelId] = db;
  }
  return db;
}
