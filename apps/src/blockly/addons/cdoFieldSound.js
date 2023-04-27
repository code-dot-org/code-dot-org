import GoogleBlockly from 'blockly/core';

export default class CdoFieldSound extends GoogleBlockly.Field {
  constructor(value, validator, onChange) {
    super(value);

    this.onChange = onChange;
    this.SERIALIZABLE = true;
  }
  /**
   * Validate the changes to the field's value before they are set.
   * @override
   * @param newValue The value that is being validated
   * @returns `String`
   */
  doClassValidation_(newValue) {
    // Maintain support for the default value 'Choose', used with CDO Blockly.
    if (newValue === null || newValue === undefined || newValue === 'Choose') {
      return 'sound://default.mp3';
    }
    return String(newValue);
  }

  static fromJson(options) {
    return new CdoFieldSound(options);
  }

  initView() {
    super.initView();
  }

  showEditor_() {
    this.onChange();
    super.showEditor_();
  }

  getText() {
    let text = this.value_;
    if (!text) {
      return text;
    }
    return parsePathString(text);
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function parsePathString(text) {
  // Example string paths:
  // 'sound://category_board_games/card_dealing_multiple.mp3'
  // 'sound://default.mp3'
  const pathStringArray = text.split('/');
  let category = '';
  // Some sounds do not include a category, such as default.mp3
  if (pathStringArray[2].includes('category_')) {
    // Example: 'category_board_games' becomes 'Board games: '
    category = capitalizeFirstLetter(
      pathStringArray[2].replace('category_', '').replaceAll('_', ' ') + ': '
    );
  }
  // Example: 'card_dealing_multiple.mp3' becomes 'Card dealing multiple'
  const soundName = capitalizeFirstLetter(
    pathStringArray[pathStringArray.length - 1]
      .replace('.mp3', '')
      .replaceAll('_', ' ')
  );

  // Examples: 'Board Games: Card dealing multiple', 'Default'
  const fieldText = `${category}${soundName}`;
  return fieldText;
}
