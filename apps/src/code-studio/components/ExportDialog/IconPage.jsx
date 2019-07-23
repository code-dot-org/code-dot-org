import React from 'react';
import color from '../../../util/color';
import exportExpoIconPng from '../../../templates/export/expo/icon.png';
import commonStyles from './styles';

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
  iconImage: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: '100%',
    height: 'auto',
    transform: 'translate(-50%,-50%)',
    msTransform: 'translate(-50%,-50%)',
    WebkitTransform: 'translate(-50%,-50%)'
  },
  uploadIconButton: {
    ...commonStyles.button,
    backgroundColor: color.default_blue,
    color: color.white
  }
};

/**
 * Icon Page in Export Dialog
 */
export default class IconPage extends React.Component {
  render() {
    return (
      <div>
        <div style={commonStyles.section}>
          <p style={commonStyles.title}>Upload your App icon</p>
        </div>
        <div style={commonStyles.section}>
          <div style={styles.icon}>
            <img style={styles.iconImage} src={exportExpoIconPng} />
          </div>
          <button
            type="button"
            style={styles.uploadIconButton}
            onClick={this.onUploadIcon}
          >
            Upload another image
          </button>
        </div>
      </div>
    );
  }

  uploadIcon = () => {
    // TODO: implement icon upload
  };
}
