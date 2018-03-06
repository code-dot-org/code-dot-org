import React, { PropTypes } from 'react';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import BaseDialog from '../BaseDialog';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

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
    const { icon, reference, text, highlight} = this.props;

    const iconStyle = highlight ? {...styles.commonIcon, ...styles.mapIcon} : {...styles.commonIcon, ...styles.resourceIcon};
    const thumbnailStyle = highlight ? {...styles.commonThumbnail, ...styles.mapThumbnail} : {...styles.commonThumbnail};

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
          fullWidth={true}
          fullHeight={true}
        >
          <iframe style={styles.linkFrame} src={reference}/>
        </BaseDialog>
      </div>
    );
  }
}

export default Radium(ResourceLink);
