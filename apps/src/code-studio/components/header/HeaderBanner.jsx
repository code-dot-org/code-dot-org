import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import color from '@cdo/apps/util/color';

import remeasureOnFontsReady from './remeasureOnFontsReady';

const IMAGE_SIZE = 32;

/**
 * A unit's logo and the current level's header label, in the header slot
 * that otherwise holds the progress bubbles. Reports its natural width to
 * the header the way LessonProgress does, so the header's width budget
 * applies unchanged.
 */
export default class HeaderBanner extends React.Component {
  static propTypes = {
    imageUrl: PropTypes.string,
    label: PropTypes.string,
    width: PropTypes.number,
    setDesiredWidth: PropTypes.func,
  };

  componentDidMount() {
    this.setDesiredWidth();
    this.cancelFontRemeasure = remeasureOnFontsReady(() =>
      this.setDesiredWidth()
    );
  }

  componentDidUpdate() {
    this.setDesiredWidth();
  }

  componentWillUnmount() {
    this.cancelFontRemeasure?.();
  }

  setDesiredWidth() {
    const inner = $(this.refs.inner);
    if (this.props.setDesiredWidth && inner.length > 0) {
      this.props.setDesiredWidth(inner.outerWidth());
    }
  }

  render() {
    const {imageUrl, label, width} = this.props;
    return (
      <div id="header_banner" style={{width, overflow: 'hidden'}}>
        <div ref="inner" style={styles.banner}>
          {imageUrl && <img src={imageUrl} alt="" style={styles.image} />}
          {label && <span style={styles.label}>{label}</span>}
        </div>
      </div>
    );
  }
}

const styles = {
  banner: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 50,
    padding: '0 5px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 6,
    flex: 'none',
    objectFit: 'cover',
  },
  label: {
    marginLeft: 12,
    color: color.white,
    fontSize: 16,
    lineHeight: '50px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};
