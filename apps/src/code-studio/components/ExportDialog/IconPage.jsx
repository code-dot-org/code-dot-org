import PropTypes from 'prop-types';
import React from 'react';
import color from '../../../util/color';
import exportExpoIconPng from '../../../templates/export/expo/icon.png';
import commonStyles from './styles';

/**
 * Icon Page in Export Dialog
 */
export default class IconPage extends React.Component {
  static propTypes = {
    iconFileUrl: PropTypes.string,
    onIconSelected: PropTypes.func.isRequired
  };

  render() {
    const {iconFileUrl} = this.props;
    const imgSrc = iconFileUrl || exportExpoIconPng;
    return (
      <div>
        <div style={commonStyles.section}>
          <p style={commonStyles.title}>Upload your App icon</p>
        </div>
        <div style={commonStyles.section}>
          <div style={styles.icon}>
            <img src={imgSrc} />
          </div>
          <button
            type="button"
            style={styles.uploadIconButton}
            onClick={this.onUploadIcon}
          >
            Upload another image
          </button>
        </div>
        <input
          ref={input => (this.uploadFileInput = input)}
          type="file"
          style={styles.hiddenFileInput}
          accept="image/png"
          onChange={this.onUploadFileInputChange}
        />
      </div>
    );
  }

  onUploadFileInputChange = () => {
    if (!this.uploadFileInput.value) {
      return;
    }
    const {onIconSelected} = this.props;
    onIconSelected(URL.createObjectURL(this.uploadFileInput.files[0]));
  };

  onUploadIcon = () => {
    this.uploadFileInput.click();
  };
}

const styles = {
  icon: {
    marginRight: 10,
    width: 125,
    height: 125,
    overflow: 'hidden',
    borderRadius: 2,
    border: '1px solid rgb(187,187,187)',
    backgroundColor: color.black,
    position: 'relative',
    display: 'inline-block'
  },
  uploadIconButton: {
    ...commonStyles.button,
    backgroundColor: color.default_blue,
    color: color.white
  },
  hiddenFileInput: {
    display: 'none'
  }
};
