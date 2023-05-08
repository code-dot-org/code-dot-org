import {SOUND_PREFIX} from '@cdo/apps/assetManagement/assetPrefix';

// NOTE: min and max are inclusive
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Requires two arrays
export function arrayEquals(a, b) {
  if (a.length !== b.length) {
    return false;
  } // compare the value of each element in the array

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function parseSoundPathString(text) {
  // Example string paths:
  // 'sound://category_board_games/card_dealing_multiple.mp3'
  // 'sound://default.mp3'
  if (!text.startsWith(SOUND_PREFIX) || !text.endsWith('.mp3')) {
    throw new Error('This is not a valid path to a sound file.');
  }
  const pathStringArray = text.split('/');
  let category = '';
  // Some sounds do not include a category, such as default.mp3
  if (pathStringArray[2].includes('category_')) {
    category = pathStringArray[2];
    // Example: 'category_board_games' becomes 'Board games: '
    category = category.replace('category_', '');
    category = category.replace(/_/g, ' ');
    category = capitalizeFirstLetter(category) + ': ';
  }
  // Example: 'card_dealing_multiple.mp3' becomes 'card_dealing_multiple'
  const soundName = pathStringArray[pathStringArray.length - 1].replace(
    '.mp3',
    ''
  );
  // Examples: 'Board games: card_dealing_multiple', 'default'
  const fieldText = `${category}${soundName}`;
  return fieldText;
}
