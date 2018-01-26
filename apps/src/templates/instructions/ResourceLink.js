import React, { PropTypes } from 'react';
import Radium from 'radium';
import color from '@cdo/apps/util/color';

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
    height: 40,
    width: 'auto',
    paddingLeft: 27,
    paddingRight: 27,
    paddingTop: 16,
    paddingBottom: 9,
    marginLeft: 5
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
};

class ResourceLink extends React.Component {
  static propTypes = {
    map: PropTypes.bool.isRequired,
    text: PropTypes.string,
  };

  render() {
    const { map, text } = this.props;

    const iconStyle = map ? {...styles.commonIcon, ...styles.mapIcon} : {...styles.commonIcon, ...styles.resourceIcon};
    const thumbnailStyle = map ? {...styles.commonThumbnail, ...styles.mapThumbnail} : {...styles.commonThumbnail};

    return (
      <a>
        <div>
          <span style={thumbnailStyle}>
              <i style={iconStyle} className={map ? "fa fa-map" : "fa fa-book"}/>
          </span>
          {text && (
            <div style={styles.textLink}>
              {text}
            </div>
          )}
        </div>
      </a>
    );
  }
}

export default Radium(ResourceLink);
