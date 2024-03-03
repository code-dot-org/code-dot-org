import {collaborativeEditor} from '@cdo/apps/collab';

document.addEventListener('DOMContentLoaded', event => {
  const clientID = Math.random().toString(36).substring(4);
  collaborativeEditor('#editor1', clientID, window.collabID);
});
