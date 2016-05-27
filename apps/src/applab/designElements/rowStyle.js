var color = require('../../color');

module.exports.input = {
  display: 'inline-block',
  height: 20,
  padding: '4px 6px',
  marginBottom: 0,
  marginLeft: 0,
  fontSize: 14,
  lineHeight: '20px',
  color: color.charcoal,
  WebkitBorderRadius: 4,
  MozBorderRadius: 4,
  borderRadius: 4,
  border: '1px solid ' + color.light_gray,
  verticalAlign: 'middle'
};

module.exports.container = {
  paddingLeft: 20,
  marginBottom: 8
};

module.exports.maxWidth = {
  maxWidth: 245
};

module.exports.description = {
  paddingLeft: 2
};

module.exports.checkbox = {
  width: 20,
  height: 20,
  fontSize: 20,
  paddingLeft: 2
};
