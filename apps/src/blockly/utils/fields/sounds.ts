import {SOUND_PREFIX} from '@cdo/apps/assetManagement/assetPrefix';
import {DEFAULT_SOUND} from '@cdo/apps/blockly/constants';

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function parseSoundPathString(text: string) {
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

export function soundField(
  onClick: () => void,
  transformText?: (text: string) => string,
  icon?: SVGElement
) {
  // Handle legacy or malformed serialized sound values by falling back
  // to the default sound.
  const validator = (newValue: string) => {
    if (typeof newValue !== 'string') {
      return null;
    }
    if (!newValue.startsWith(SOUND_PREFIX) || !newValue.endsWith('.mp3')) {
      console.error(
        'An invalid sound value was selected. Therefore, the default sound value will be used.'
      );
      return DEFAULT_SOUND;
    }
    return newValue;
  };
  return new Blockly.FieldButton({
    value: DEFAULT_SOUND,
    validator,
    onClick,
    transformText,
    icon,
  });
}
