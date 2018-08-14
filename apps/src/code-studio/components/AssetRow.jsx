import React, {PropTypes} from 'react';
import AssetThumbnail from './AssetThumbnail';
import AssetActions from "./AssetActions";

export const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center'
  }
};

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
    onDelete: PropTypes.func.isRequired,

    //temp prop to hide/show recordAudio style changes
    useUpdatedStyles:PropTypes.bool
  };

  render() {
    return (
      <tr className="assetRow" onDoubleClick={this.props.onChoose} style={styles.wrapper}>
        <td width="80">
          <AssetThumbnail
            type={this.props.type}
            name={this.props.name}
            timestamp={this.props.timestamp}
            useFilesApi={this.props.useFilesApi}
            useUpdatedStyles={this.props.useUpdatedStyles}
          />
        </td>
        <td>{this.props.name}</td>
        <AssetActions
          name="audioTest"
          size={this.props.size}
          useFilesApi={this.props.useFilesApi}
          onDelete={this.props.onDelete}
          onChoose={this.props.onChoose}
          isAudio={this.props.type === 'audio'}
          useUpdatedStyles={this.props.useUpdatedStyles}
        />
      </tr>
    );
  }
}
