var React = require('react');

module.exports = React.PropTypes.arrayOf(React.PropTypes.shape({
  title: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
  status: React.PropTypes.string,
  kind: React.PropTypes.oneOf(['unplugged', 'assessment', 'puzzle']),
  url: React.PropTypes.string,
  id: React.PropTypes.number
}));
