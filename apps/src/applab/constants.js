var utils = require('../utils');

module.exports = {
  FOOTER_HEIGHT: 30,
  APP_WIDTH: 320,
  APP_HEIGHT: 480,
  DESIGN_ELEMENT_ID_PREFIX: 'design_',
  ICON_PREFIX: 'icon://',
  ICON_PREFIX_REGEX: new RegExp('^icon://'),
  NEW_SCREEN: "New screen...",
  ApplabInterfaceMode: utils.makeEnum('CODE', 'DESIGN')
};
