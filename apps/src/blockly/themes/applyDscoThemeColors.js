import cdoBlockStyles from './cdoBlockStyles.js';

const RUN_BUTTON_COLOR = '--background-accent-orange-primary';

const getCssVariable = name => {
  // Fall back on any failure: jsdom's getComputedStyle re-matches every
  // stylesheet rule and its selector engine throws on selectors it cannot
  // parse, such as the :has() rules MUI emits.
  try {
    return window.getComputedStyle(document.body).getPropertyValue(name).trim();
  } catch {
    return '';
  }
};

export default function applyDscoThemeColors(themes) {
  const fallback = cdoBlockStyles.setup_blocks.colourPrimary;
  const setupBlockColor = getCssVariable(RUN_BUTTON_COLOR) || fallback;

  themes.forEach(theme => {
    theme.setBlockStyle('setup_blocks', {
      ...theme.blockStyles.setup_blocks,
      colourPrimary: setupBlockColor,
    });
  });
}
