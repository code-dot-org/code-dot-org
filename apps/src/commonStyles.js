// As we move from inline css to css modules we are temporarily duplicating this
// into the css module common-styles.module.scss.
// Any changes in one should be made in the other to apply to all components.
var commonStyles = module.exports;
var styleConstants = require('./styleConstants');
var color = require('./util/color');

commonStyles.hidden = {
  display: 'none',
};

commonStyles.purpleHeader = {
  height: styleConstants['workspace-headers-height'],
  backgroundColor: color.purple,
  color: color.white,
  overflowY: 'hidden',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  userSelect: 'none',
};

commonStyles.purpleHeaderUnfocused = {
  backgroundColor: color.lighter_purple,
  color: color.neutral_white,
};

commonStyles.teacherBlueHeader = {
  backgroundColor: color.cyan,
  color: color.lightest_cyan,
};

commonStyles.teacherHeaderUnfocused = {
  color: color.dark_charcoal,
};

commonStyles.minecraftHeader = {
  backgroundColor: '#3b3b3b',
  color: color.white,
};

commonStyles.button = {
  paddingTop: 5,
  paddingBottom: 5,
  fontSize: 14,
};

// Div contain instructions, either below visualization or in top instructions
// May not need a common location once everything is in top instructions
commonStyles.bubble = {
  color: color.black,
  marginBottom: 10,
  position: 'relative',
  cursor: 'pointer',
};
