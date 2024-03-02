import {setupEditor} from '@cdo/apps/collab';

document.addEventListener('DOMContentLoaded', event => {
  const clientID = Math.random().toString(36).substring(4);
  setupEditor('#editor1', clientID, window.collabID);
});
