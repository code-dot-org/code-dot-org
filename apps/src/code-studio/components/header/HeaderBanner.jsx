import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import color from '@cdo/apps/util/color';

import remeasureOnFontsReady from './remeasureOnFontsReady';

const IMAGE_SIZE = 32;

// Lab2 moves between a lesson's levels without a page load, so the bar is
// still mounted when the level changes and can slide to its new fill.
const FILL_TRANSITION = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  .matches
  ? undefined
  : 'width 400ms ease-out';

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
    /** The lesson's levels with progress, as getCurrentLevels gives them. */
    levels: PropTypes.array,
    width: PropTypes.number,
    setDesiredWidth: PropTypes.func,
  };

  // Where the current level sits among the levels sharing its header label:
  // the label, its 1-based position and their count. Position and total are
  // absent when the label covers one level; all three when it has no label.
  static subPathFor(levels) {
    const current = levels?.find(l => l.isCurrentLevel);
    if (!current?.headerLabel) {
      return null;
    }
    const path = levels.filter(l => l.headerLabel === current.headerLabel);
    return path.length > 1
      ? {
          label: current.headerLabel,
          position: path.indexOf(current) + 1,
          total: path.length,
        }
      : {label: current.headerLabel};
  }

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
    const {imageUrl, levels, width} = this.props;
    const subPath = HeaderBanner.subPathFor(levels);
    const label = subPath?.label;
    const progress = subPath?.total ? subPath : null;
    return (
      <div id="header_banner" style={{width, overflow: 'hidden'}}>
        <div ref="inner" style={styles.banner}>
          {imageUrl && <img src={imageUrl} alt="" style={styles.image} />}
          {label && (
            // Keyed on the label so a new part starts at its own fill rather
            // than sliding from the last part's.
            <div key={label} style={styles.text}>
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
    transition: FILL_TRANSITION,
  },
};
