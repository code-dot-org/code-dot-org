import React from 'react';
import msg from '@cdo/locale';
import * as imageUtils from '@cdo/apps/imageUtils';
import color from '@cdo/apps/util/color';

const styles = {
  icon: {
    lineHeight: 'inherit',
    color: color.white,
    paddingRight: 8
  },
  container: {
    lineHeight: '40px',
    textAlign: 'center',
    verticalAlign: 'middle',
    display: 'inline-block',
    textSize: 'large'
  },
  button: {
    padding: '0px 8px',
    lineHeight: '40px',
    borderRadius: 5,
    backgroundColor: color.cyan,
    borderColor: color.cyan,
    color: color.white
  }
};

class SaveImageButton extends React.Component {
  save = async () => {
    const canvasEl = document.getElementById('display');
    const blob = await imageUtils.canvasToBlob(canvasEl);
    const download = document.createElement('a');
    download.href = URL.createObjectURL(blob);
    download.download = 'image.png';
    download.click();
  };

  render() {
    return (
      <button type="button" style={styles.button} onClick={this.save}>
        <i style={styles.icon} className="fa fa-fw fa-camera" />
        {msg.save()}
      </button>
    );
  }
}

export default SaveImageButton;
