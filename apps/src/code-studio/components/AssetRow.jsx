import React, {PropTypes} from 'react';
import {assets as assetsApi, files as filesApi} from '@cdo/apps/clientApi';
import AssetThumbnail from './AssetThumbnail';

/**
 * A single row in the AssetManager, describing one asset.
 */
export default class AssetRow extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    timestamp: PropTypes.string,
    type: PropTypes.oneOf(['image', 'audio', 'video', 'pdf', 'doc']).isRequired,
    size: PropTypes.number,
    useFilesApi: PropTypes.bool.isRequired,
    onChoose: PropTypes.func,
    onDelete: PropTypes.func.isRequired
  };

  state = {
    action: 'normal',
    actionText: ''
  };

  /**
   * Confirm the user actually wants to delete this asset.
   */
  confirmDelete = () => {
    this.setState({action: 'confirming delete', actionText: ''});
  };

  /**
   * This user didn't want to delete this asset.
   */
  cancelDelete = () => {
    this.setState({action: 'normal', actionText: ''});
  };

  /**
   * Delete this asset and notify the parent to remove this row. If the delete
   * fails, flip back to 'confirming delete' and display a message.
   */
  handleDelete = () => {
    this.setState({action: 'deleting', actionText: ''});

    let api = this.props.useFilesApi ? filesApi : assetsApi;
    api.deleteFile(this.props.name, this.props.onDelete, () => {
      this.setState({action: 'confirming delete',
          actionText: 'Error deleting file.'});
    });
  };

  render() {
    let actions, flex;
    // `flex` is the "Choose" button in file-choose mode, or the filesize.
    if (this.props.onChoose) {
      flex = <button onClick={this.props.onChoose}>Choose</button>;
    } else {
      const size = (this.props.size / 1000).toFixed(2);
      flex = size + ' kb';
    }

    const api = this.props.useFilesApi ? filesApi : assetsApi;
    const src = api.basePath(this.props.name);
    switch (this.state.action) {
      case 'normal':
        actions = (
          <td width="250" style={{textAlign: 'right'}}>
            {flex}
            <a
              href={src}
              target="_blank"
              style={{backgroundColor: 'transparent'}}
            >
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
            <i
              className="fa fa-spinner fa-spin"
              style={{
                fontSize: '32px',
                marginRight: '15px'
              }}
            ></i>
          </td>
        );
        break;
    }

    return (
      <tr className="assetRow" onDoubleClick={this.props.onChoose}>
        <td width="80">
          <AssetThumbnail
            type={this.props.type}
            name={this.props.name}
            timestamp={this.props.timestamp}
            useFilesApi={this.props.useFilesApi}
          />
        </td>
        <td>{this.props.name}</td>
        {actions}
      </tr>
    );
  }
}
