import React, {PropTypes} from 'react';
import AssetManager from './AssetManager';
import color from "../../util/color";
import IconLibrary from './IconLibrary';
import {ICON_PREFIX} from '@cdo/apps/applab/constants';

const extensionFilter = {
  image: '.jpg, .jpeg, .gif, .png',
  audio: '.mp3',
  document: '.jpg, .jpeg, .gif, .png, .pdf, .doc, .docx'
};

/**
 * A component for managing hosted assets.
 */
export default class ImagePicker extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func,
    assetsChanged: PropTypes.func,
    typeFilter: PropTypes.string,
    uploadsEnabled: PropTypes.bool.isRequired,
    showUnderageWarning: PropTypes.bool.isRequired,
    useFilesApi: PropTypes.bool,
    soundPlayer: PropTypes.object,
    disableAudioRecording: PropTypes.bool,
    //For logging upload failures
    projectId: PropTypes.string
  };

  state = {mode: 'files'};

  getAssetNameWithPrefix = (icon) => {
    this.props.assetChosen(ICON_PREFIX + icon);
  };

  setIconMode = () => this.setState({mode: 'icons'});

  setFileMode = () => this.setState({mode: 'files'});

  render() {
    const isFileMode = this.state.mode === 'files';
    const styles = {
      root: {
        margin: "0 0 0 5px"
      },
      fileModeToggle: {
        float: 'left',
        margin: '0 20px 0 0',
        fontFamily: isFileMode ? '"Gotham 5r"' : null,
        color: isFileMode ? null : '#999',
        fontSize: '16px',
        cursor: 'pointer'
      },
      iconModeToggle: {
        margin: 0,
        fontSize: '16px',
        fontFamily: isFileMode ? null : '"Gotham 5r"',
        color: isFileMode ? '#999' : null,
        cursor: 'pointer'
      },
      divider: {
        borderColor: color.purple,
        margin: '5px 0'
      },
      warning: {
        color: color.red,
        fontSize: 13,
        fontWeight: 'bold',
      },
    };

    let modeSwitch, title = this.props.assetChosen ?
      <p className="dialog-title">Choose Assets</p> :
      <p className="dialog-title">Manage Assets</p>;

    const imageTypeFilter = !this.props.typeFilter || this.props.typeFilter === 'image';
    if (this.props.assetChosen && imageTypeFilter) {
      modeSwitch = (<div>
        <p onClick={this.setFileMode} style={styles.fileModeToggle}>My Files</p>
        <p onClick={this.setIconMode} style={styles.iconModeToggle}>Icons</p>
        <hr style={styles.divider}/>
      </div>);
    }

    const body = !this.props.assetChosen || this.state.mode === 'files' ?
      <AssetManager
        assetChosen={this.props.assetChosen}
        assetsChanged={this.props.assetsChanged}
        allowedExtensions={extensionFilter[this.props.typeFilter]}
        uploadsEnabled={this.props.uploadsEnabled}
        useFilesApi={this.props.useFilesApi}
        projectId={this.props.projectId}
        soundPlayer={this.props.soundPlayer}
        disableAudioRecording={this.props.disableAudioRecording}
        imagePicker={true}
      /> :
      <IconLibrary assetChosen={this.getAssetNameWithPrefix}/>;

    return (
      <div className="modal-content" style={styles.root}>
        {title}
        {this.props.showUnderageWarning && (
          <p style={styles.warning}>
            Warning: Do not upload anything that contains personal information.
          </p>
        )}
        {modeSwitch}
        {body}
      </div>
    );
  }
}
