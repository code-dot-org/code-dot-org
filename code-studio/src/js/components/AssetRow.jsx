var assetsApi = require('@cdo/apps/clientApi').assets;
var AssetThumbnail = require('./AssetThumbnail');

/**
 * A single row in the AssetManager, describing one asset.
 */
var AssetRow = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    type: React.PropTypes.oneOf(['image', 'audio', 'video', 'pdf']).isRequired,
    size: React.PropTypes.number,
    onChoose: React.PropTypes.func,
    onDelete: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      action: 'normal',
      actionText: ''
    };
  },

  /**
   * Confirm the user actually wants to delete this asset.
   */
  confirmDelete: function () {
    this.setState({action: 'confirming delete', actionText: ''});
  },

  /**
   * This user didn't want to delete this asset.
   */
  cancelDelete: function () {
    this.setState({action: 'normal', actionText: ''});
  },

  /**
   * Delete this asset and notify the parent to remove this row. If the delete
   * fails, flip back to 'confirming delete' and display a message.
   */
  handleDelete: function () {
    this.setState({action: 'deleting', actionText: ''});

    // TODO: Use Dave's client api when it's finished.
    assetsApi.ajax('DELETE', this.props.name, this.props.onDelete, function () {
      this.setState({action: 'confirming delete',
          actionText: 'Error deleting file.'});
    }.bind(this));
  },

  render: function () {
    var actions, flex;
    // `flex` is the "Choose" button in file-choose mode, or the filesize.
    if (this.props.onChoose) {
      flex = <button onClick={this.props.onChoose}>Choose</button>;
    } else {
      var size = (this.props.size / 1000).toFixed(2);
      flex = size + ' kb';
    }

    switch (this.state.action) {
      case 'normal':
        var src = assetsApi.basePath(this.props.name);
        actions = (
          <td width="250" style={{textAlign: 'right'}}>
            {flex}
            <a href={src}
                target="_blank"
                style={{backgroundColor: 'transparent'}}>
              <button><i className="fa fa-eye"></i></button>
            </a>
            <button className="btn-danger" onClick={this.confirmDelete}>
              <i className="fa fa-trash-o"></i>
            </button>
            {this.state.actionText}
          </td>
        );
        break;
      case 'confirming delete':
        actions = (
          <td width="250" style={{textAlign: 'right'}}>
            <button className="btn-danger" onClick={this.handleDelete}>
              Delete File
            </button>
            <button onClick={this.cancelDelete}>Cancel</button>
            {this.state.actionText}
          </td>
        );
        break;
      case 'deleting':
        actions = (
          <td width="250" style={{textAlign: 'right'}}>
            <i className="fa fa-spinner fa-spin" style={{
              fontSize: '32px',
              marginRight: '15px'
            }}></i>
          </td>
        );
        break;
    }

    return (
      <tr className="assetRow" onDoubleClick={this.props.onChoose}>
        <AssetThumbnail type={this.props.type} name={this.props.name}/>
        <td>{this.props.name}</td>
        {actions}
      </tr>
    );
  }
});
module.exports = AssetRow;
