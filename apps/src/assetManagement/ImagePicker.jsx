var AssetManager = require('./AssetManager.jsx');
var IconLibrary = require('./IconLibrary.jsx');

/**
 * A component for managing hosted assets.
 */
module.exports = React.createClass({
  propTypes: {
    assetChosen: React.PropTypes.func,
    typeFilter: React.PropTypes.string,
    channelId: React.PropTypes.string.isRequired,
    uploadsEnabled: React.PropTypes.bool.isRequired
  },

  getInitialState: function () {
    return {mode: 'files'};
  },

  setIconMode: function () {
    this.setState({mode: 'icons'});
  },

  setFileMode: function () {
    this.setState({mode: 'files'});
  },

  render: function () {

    var modeSwitch, title = this.props.assetChosen ?
      <p className="dialog-title">Choose Assets</p> :
      <p className="dialog-title">Manage Assets</p>;

    if (this.props.assetChosen) {
      modeSwitch = <div>
        <p onClick={this.setFileMode} style={{float: 'left', margin: '0 20px 0 0', fontSize: '14px', cursor: 'pointer'}}>My Files</p>
        <p onClick={this.setIconMode} style={{fontSize: '16px', margin: '0', color: '#999', cursor: 'pointer'}}>Icons</p>
        <hr style={{borderColor: '#7665a0', margin: '5px 0'}}/>
      </div>;
    }

    var body = !this.props.assetChosen || this.state.mode === 'files' ?
      <AssetManager
        assetChosen={this.props.assetChosen}
        typeFilter={this.props.typeFilter}
        channelId={this.props.channelId}
        uploadsEnabled={this.props.uploadsEnabled}/> :
      <IconLibrary/>;

    return (
      <div className="modal-content" style={{margin: "0 0 0 -10px"}}>
        {title}
        {modeSwitch}
        {body}
      </div>
    );
  }
});
