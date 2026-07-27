import cdoBlockStyles from './cdoBlockStyles.js';

const RUN_BUTTON_COLOR = '--background-accent-orange-primary';

const getCssVariable = name =>
  typeof window !== 'undefined' && document.body
    ? window.getComputedStyle(document.body).getPropertyValue(name).trim()
    : '';

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
