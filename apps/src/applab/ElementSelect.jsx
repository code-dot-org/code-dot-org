var elementUtils = require('./designElements/elementUtils.js');

module.exports = React.createClass({
  propTypes: {
    onChangeElement: React.PropTypes.func.isRequired,
    elementIdList: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    selected: React.PropTypes.instanceOf(HTMLElement)
  },

  handleChange: function (e) {
    var element = elementUtils.getPrefixedElementById(e.target.value);
    this.props.onChangeElement(element, null);
  },

  render: function () {
    var selected = elementUtils.getId(this.props.selected);

    return (
      <div style={{float: 'right', marginRight: '-10px'}}>
        <select value={selected} onChange={this.handleChange} style={{width: '150px'}}>
          {this.props.elementIdList.map(function (id) {
            return <option key={id}>{id}</option>;
          })}
        </select>
      </div>
    );
  }
});
