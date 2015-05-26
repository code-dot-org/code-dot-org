var React = require('react');
var designMode = require('../designMode');

var PropertyRow = React.createClass({
  propTypes: {
    initialValue: React.PropTypes.string.isRequired,
    handleChange: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      value: this.props.initialValue
    };
  },

  handleChangeInternal: function (event) {
    this.changeImage(event.target.value);
  },

  handleButtonClick: function () {
    // TODO: This isn't the pure-React way of referencing the AssetManager
    // component. Ideally we'd be able to `require` it directly without needing
    // to know about `designMode`.
    //
    // However today the `createModalDialog` function and `Dialog` component
    // are intertwined with `StudioApp` which is why we have this direct call.
    designMode.showAssetManager(this.changeImage, 'image');
  },

  changeImage: function (filename) {
    this.props.handleChange(filename);
    this.setState({value: filename});
  },

  render: function() {
    return (
      <tr>
        <td>{this.props.desc}</td>
        <td>
          <input
            value={this.state.value}
            onChange={this.handleChangeInternal}/>
          <button onClick={this.handleButtonClick}>
            <i className='fa fa-picture-o'></i>
          </button>
        </td>
      </tr>
    );
  }
});

module.exports = PropertyRow;
