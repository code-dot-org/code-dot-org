var AssetManager = require('./AssetManager.jsx');

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

  render: function () {

    var title = this.props.assetChosen ?
      <p className="dialog-title">Choose Assets</p> :
      <p className="dialog-title">Manage Assets</p>;

    return (
      <div className="modal-content" style={{margin: "0 0 0 -10px"}}>
        {title}
        <div>
          <p style={{float: 'left', margin: '0 20px 0 0', fontSize: '14px'}}>My Files</p>
          <p style={{fontSize: '16px', margin: '0', color: '#999'}}>Icons</p>
          <hr style={{borderColor: '#7665a0', margin: '5px 0'}}/>
        </div>
        <AssetManager
          assetChosen={this.props.assetChosen}
          typeFilter={this.props.typeFilter}
          channelId={this.props.channelId}
          uploadsEnabled={this.props.uploadsEnabled}/>
      </div>
    );
  }
});
