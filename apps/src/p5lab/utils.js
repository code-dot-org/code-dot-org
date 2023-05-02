import {DEFAULT_SOUND} from '@cdo/apps/blockly/constants';

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

export function parsePathString(text) {
  // Example string paths:
  // 'sound://category_board_games/card_dealing_multiple.mp3'
  // 'sound://default.mp3'
  if (!text.includes('.mp3')) {
    return DEFAULT_SOUND;
  }
  const pathStringArray = text.split('/');
  let category = '';
  // Some sounds do not include a category, such as default.mp3
  if (pathStringArray[2].includes('category_')) {
    // Example: 'category_board_games' becomes 'Board games: '
    category = capitalizeFirstLetter(
      pathStringArray[2].replace('category_', '').replaceAll('_', ' ') + ': '
    );
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
