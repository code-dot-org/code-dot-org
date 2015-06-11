var React = require('react');
var showAssetManager = require('../assetManagement/show.js');

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
    showAssetManager(this.changeImage, 'image');
  },

  changeImage: function (filename) {
    this.props.handleChange(filename);
    this.setState({value: filename});
  },

  render: function() {
    return (
      <div>
        <div>{this.props.desc}</div>
        <div>
          <input
            value={this.state.value}
            onChange={this.handleChangeInternal}/>
          &nbsp;
          <a onClick={this.handleButtonClick}>
            Choose...
          </a>
        </div>
      </div>
    );
  }
});

module.exports = PropertyRow;
