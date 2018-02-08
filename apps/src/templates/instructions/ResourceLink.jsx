import React, { PropTypes } from 'react';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import BaseDialog from '../BaseDialog';

const styles = {
  textLink: {
    display: 'inline-block',
    margin: 8,
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: '25px',
    cursor: 'pointer',
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
    map: PropTypes.bool.isRequired,
    text: PropTypes.string,
    reference: PropTypes.string,
  };

  state = {
    dialogSelected: false,
  };

  selectResource = () => {
    this.setState({dialogSelected: true});
  };

  closeResource = () => {
    this.setState({dialogSelected: false});
  };

  render() {
    const { map, text } = this.props;

    const iconStyle = map ? {...styles.commonIcon, ...styles.mapIcon} : {...styles.commonIcon, ...styles.resourceIcon};
    const thumbnailStyle = map ? {...styles.commonThumbnail, ...styles.mapThumbnail} : {...styles.commonThumbnail};

    return (
      <div>
        <div style={styles.resourceStyle} onClick={this.selectResource}>
          <span style={thumbnailStyle}>
              <i style={iconStyle} className={map ? "fa fa-map" : "fa fa-book"}/>
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
          <iframe style={styles.linkFrame} src={this.props.reference}/>
        </BaseDialog>
      </div>
    );
  }
}

export default Radium(ResourceLink);
