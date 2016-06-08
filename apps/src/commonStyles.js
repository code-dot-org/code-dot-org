var commonStyles = module.exports;
var color = require('./color');
var styleConstants = require('./styleConstants');

commonStyles.hidden = {
  display: 'none'
};

commonStyles.purpleHeader = {
  height: styleConstants["workspace-headers-height"],
  backgroundColor: color.purple,
  color: color.white,
  overflowY: 'hidden',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  userSelect: 'none',
};

commonStyles.purpleHeaderReadOnly = {
  backgroundColor: color.charcoal,
};

commonStyles.purpleHeaderUnfocused = {
  backgroundColor: color.lighter_purple,
  color: color.dark_charcoal,
};

commonStyles.button = {
  paddingTop: 5,
  paddingBottom: 5,
  fontSize: 14
};

// Div contain instructions, either below visualization or in top instructions
// May not need a common location once everything is in top instructions
commonStyles.bubble = {
  color: color.black,
  marginBottom: 10,
  position: 'relative',
  cursor: 'default'
};
