var commonStyles = module.exports;
var color = require('./color');
var styleConstants = require('./styleConstants');

commonStyles.hidden = {
  display: 'none'
};

commonStyles.purpleHeader = {
  height: styleConstants["workspace-headers-height"],
  backgroundColor: color.purple,
  overflowY: 'hidden',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  userSelect: 'none',
};

commonStyles.purpleHeaderReadOnly = {
  backgroundColor: color.charcoal
};

commonStyles.purpleHeaderRunning = {
  backgroundColor: color.lighter_purple
};
