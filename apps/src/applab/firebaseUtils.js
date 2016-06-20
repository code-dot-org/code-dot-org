/* global Applab */

import Firebase from 'firebase';
let firebaseCache;

export function getConfig() {
  return getFirebase().child('v3/config');
}

export function getDatabase(channelId) {
  return getFirebase().child(`v3/channels/${channelId}`);
}

function getFirebase() {
  let fb = firebaseCache;
  if (!fb) {
    if (!Applab.firebaseName) {
      throw new Error("Error connecting to Firebase: Firebase name not specified");
    }
    if (!Applab.firebaseAuthToken) {
      throw new Error("Error connecting to Firebase: Firebase auth token not specified");
    }
    let base_url = `https://${Applab.firebaseName}.firebaseio.com`;
    fb = new Firebase(base_url);
    if (Applab.firebaseAuthToken) {
      fb.authWithCustomToken(Applab.firebaseAuthToken, (err, user) => {
        if (err) {
          throw new Error(`error authenticating to Firebase: ${err}`);
        } else {
          Applab.firebaseUserId = user.uid;
        }
      });
    }
    firebaseCache = fb;
  }
  return fb;
}
