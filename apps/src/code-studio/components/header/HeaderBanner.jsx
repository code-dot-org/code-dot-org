import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import color from '@cdo/apps/util/color';

import remeasureOnFontsReady from './remeasureOnFontsReady';

const IMAGE_SIZE = 32;

/**
 * A unit's logo, the current level's header label and, under the label, a
 * bar showing where the level sits among those sharing it, in the header
 * slot that otherwise holds the progress bubbles. The two lines sit where
 * the unit name and its saved-at line sit on the left. Reports its natural
 * width to the header the way LessonProgress does, so the header's width
 * budget applies unchanged.
 */
export default class HeaderBanner extends React.Component {
  static propTypes = {
    imageUrl: PropTypes.string,
    label: PropTypes.string,
    /** The current level's place among those under the label, 1-based, and
        their count; absent for a lone level. */
    progress: PropTypes.shape({
      position: PropTypes.number.isRequired,
      total: PropTypes.number.isRequired,
    }),
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
    const {imageUrl, label, progress, width} = this.props;
    return (
      <div id="header_banner" style={{width, overflow: 'hidden'}}>
        <div ref="inner" style={styles.banner}>
          {imageUrl && <img src={imageUrl} alt="" style={styles.image} />}
          {label && (
            <div style={styles.text}>
              <span style={styles.label}>{label}</span>
              {progress && (
                <div style={styles.barRow}>
                  <div
                    style={styles.track}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={progress.total}
                    aria-valuenow={progress.position}
                    aria-valuetext={`Level ${progress.position} of ${progress.total}`}
                  >
                    <div
                      style={{
                        ...styles.fill,
                        width: `${(100 * progress.position) / progress.total}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
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
    boxSizing: 'border-box',
    border: `1px solid ${color.white}`,
    borderRadius: 6,
    backgroundColor: color.black,
    flex: 'none',
    objectFit: 'cover',
  },
  // The unit name on the left is a 16px line over a 14px saved-at line; the
  // label and the bar take the same two lines.
  text: {
    marginLeft: 12,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 80,
  },
  label: {
    color: color.white,
    fontSize: 16,
    lineHeight: '24px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  barRow: {
    height: 14,
    display: 'flex',
    alignItems: 'center',
  },
  track: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: color.white,
  },
};
