import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import color from '@cdo/apps/util/color';

import remeasureOnFontsReady from './remeasureOnFontsReady';

const IMAGE_SIZE = 32;

/**
 * A unit's logo, the current level's header label and a segment per level
 * of the label's sub-path, in the header slot that otherwise holds the
 * progress bubbles. Reports its natural width to the header the way
 * LessonProgress does, so the header's width budget applies unchanged.
 */
export default class HeaderBanner extends React.Component {
  static propTypes = {
    imageUrl: PropTypes.string,
    label: PropTypes.string,
    /** One per level sharing the label, in order; absent for a lone level. */
    steps: PropTypes.arrayOf(
      PropTypes.shape({
        completed: PropTypes.bool.isRequired,
        current: PropTypes.bool.isRequired,
      })
    ),
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
    const {imageUrl, label, steps, width} = this.props;
    const completed = steps?.filter(step => step.completed).length;
    return (
      <div id="header_banner" style={{width, overflow: 'hidden'}}>
        <div ref="inner" style={styles.banner}>
          {imageUrl && <img src={imageUrl} alt="" style={styles.image} />}
          {label && <span style={styles.label}>{label}</span>}
          {steps && (
            <span
              style={styles.steps}
              role="img"
              aria-label={`${completed} of ${steps.length} complete`}
            >
              {steps.map((step, i) => (
                <span
                  key={i}
                  style={{
                    ...styles.step,
                    ...(step.completed && styles.completedStep),
                    ...(step.current && styles.currentStep),
                  }}
                />
              ))}
            </span>
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
  label: {
    marginLeft: 12,
    color: color.white,
    fontSize: 16,
    lineHeight: '50px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  steps: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    marginLeft: 12,
    flex: 'none',
  },
  step: {
    width: 10,
    height: 6,
    borderRadius: 3,
    boxSizing: 'border-box',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  completedStep: {
    backgroundColor: color.white,
  },
  // The current level is hollow: a ring, filled or not, so it stands out
  // whether or not it is already complete.
  currentStep: {
    backgroundColor: 'transparent',
    border: `2px solid ${color.white}`,
  },
};
