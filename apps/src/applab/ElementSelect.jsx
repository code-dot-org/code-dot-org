var elementUtils = require('./designElements/elementUtils.js');

module.exports = React.createClass({
  propTypes: {
    elements: React.PropTypes.arrayOf(React.PropTypes.string),
    selected: React.PropTypes.instanceOf(HTMLElement)
  },

  getInitialState: function() {
    return {};
  },

  render: function() {
    var selected = elementUtils.getId(this.props.selected);

    return (
      <div style={{float: 'right', marginRight: '-10px'}}>
        <select value={selected} style={{width: '150px'}}>
          {this.props.elements.map(function (element) {
            return <option>{element.display}</option>;
          })}
        </select>
      </div>
    );
  }
});
