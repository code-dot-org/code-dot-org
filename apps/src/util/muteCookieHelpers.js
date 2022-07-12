import cookies from 'js-cookie';

const MUTE_MUSIC = 'mute_music';

export const muteCookieWithLevel = level => {
  return level.muteMusic || cookies.get('mute_music') === 'true';
};

export const muteCookieValue = () => {
  return !!cookies.get('mute_music');
};

export const setMuteCookie = () => {
  cookies.set(MUTE_MUSIC, 'true', {expires: 30, path: '/'});
};

export const removeMuteCookie = () => {
  cookies.remove(MUTE_MUSIC, {path: '/'});
};
