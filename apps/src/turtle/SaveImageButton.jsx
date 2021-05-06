import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import * as imageUtils from '@cdo/apps/imageUtils';
import color from '@cdo/apps/util/color';

export default class SaveImageButton extends React.Component {
  static propTypes = {
    displayCanvas: PropTypes.instanceOf(HTMLCanvasElement).isRequired
  };

  save = async () => {
    const blob = await imageUtils.canvasToBlob(this.props.displayCanvas);
    imageUtils.downloadBlobAsPng(blob);
  };

  render() {
    return (
      <button type="button" style={styles.button} onClick={this.save}>
        <i style={styles.icon} className="fa fa-fw fa-camera" />
        {i18n.save()}
      </button>
    );
  }
}

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
