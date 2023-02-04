import Globals from '../globals';

const DEFAULT_GROUP_NAME = 'all';

const getCurrentGroup = () => {
  const library = Globals.getLibrary();

  const currentGroup = library?.groups.find(
    group => group.id === DEFAULT_GROUP_NAME
  );

  return currentGroup;
};

const getCurrentGroupSounds = () => {
  return getCurrentGroup()?.folders;
};

export const getLengthForId = id => {
  const splitId = id.split('/');
  const path = splitId[0];
  const src = splitId[1];

  const sounds = getCurrentGroupSounds();
  const folder = sounds.find(folder => folder.path === path);
  const sound = folder.sounds.find(sound => sound.src === src);

  return sound.length;
};
