import React, { PropTypes } from 'react';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import BaseDialog from '../BaseDialog';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const dialogRatio = 0.8;

const styles = {
  textLink: {
    display: 'inline-block',
    margin: 8,
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: '25px',
    cursor: 'pointer',
    maxWidth: '90%'
  },
  mapThumbnail: {
    backgroundColor: color.teal,
  },
  commonThumbnail: {
    borderRadius: 5,
    paddingLeft: 26,
    paddingRight: 26,
    paddingTop: 16,
    paddingBottom: 9,
  },
  commonIcon: {
    fontSize: 22,
  },
  mapIcon: {
    color: color.white
  },
  resourceIcon: {
    color: color.teal
  },
  resourceStyle: {
    margin: 8
  },
  linkFrame: {
    width: '98%',
    height: '94%'
  },
  centeredDialog: {
    top: '50%',
    left: '50%',
  }
};

class ResourceLink extends React.Component {
  static propTypes = {
    highlight: PropTypes.bool,
    icon: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    reference: PropTypes.string.isRequired,
  };

  state = {
    dialogSelected: false
  };

  selectResource = () => {
    this.setState({dialogSelected: true});
  };

  closeResource = () => {
    this.setState({dialogSelected: false});
  };

  render() {
    const {icon, reference, text, highlight} = this.props;

    const iconStyle = {
      ...styles.commonIcon,
      ...(highlight ? styles.mapIcon : styles.resourceIcon)};
    const thumbnailStyle = {
      ...styles.commonThumbnail,
      ...(highlight && styles.mapThumbnail)};

    const dialogHeight = $(window).height() * dialogRatio;
    const dialogWidth = $(window).width() * dialogRatio;

    const dialogStyle = {height: dialogHeight, width: dialogWidth,
      marginTop: (dialogHeight / -2) + 'px', marginLeft: (dialogWidth / -2) + 'px'};

    return (
      <div>
        <div style={styles.resourceStyle} onClick={this.selectResource}>
          <span style={thumbnailStyle}>
            <FontAwesome
              icon={icon}
              style={iconStyle}
              title={text}
            />
          </span>
          <a style={styles.textLink}>
            {text}
          </a>
        </div>
        <BaseDialog
          isOpen={this.state.dialogSelected}
          handleClose={this.closeResource}
          style={{...styles.centeredDialog, ...dialogStyle}}
        >
          <iframe style={styles.linkFrame} src={reference}/>
        </BaseDialog>
      </div>
    );
  }
}

export default Radium(ResourceLink);
