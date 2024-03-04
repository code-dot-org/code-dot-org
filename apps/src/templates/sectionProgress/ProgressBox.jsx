import PropTypes from 'prop-types';
import React, {Component} from 'react';
import fontConstants from '@cdo/apps/fontConstants';
import color from '@cdo/apps/util/color';

export const REGULAR_PROGRESS_BOX_SIZE = 20;

export default class ProgressBox extends Component {
  static propTypes = {
    started: PropTypes.bool,
    incomplete: PropTypes.number,
    imperfect: PropTypes.number,
    perfect: PropTypes.number,
    style: PropTypes.object,
    lessonIsAllAssessment: PropTypes.bool,
    lessonNumber: PropTypes.number,
    viewed: PropTypes.bool,
    progressBoxSize: PropTypes.number,
  };

  render() {
    const {
      started,
      incomplete,
      imperfect,
      perfect,
      lessonIsAllAssessment,
      viewed,
      progressBoxSize,
    } = this.props;

    const viewedStyle = {
      ...styles.filler,
      backgroundColor: color.neutral_dark20,
      height: progressBoxSize ? progressBoxSize : REGULAR_PROGRESS_BOX_SIZE,
      width: progressBoxSize ? progressBoxSize : REGULAR_PROGRESS_BOX_SIZE,
    };

    const boxWithBorderStyle = {
      ...styles.box,
      height: progressBoxSize,
      width: progressBoxSize,
      borderColor: started
        ? lessonIsAllAssessment
          ? color.level_submitted
          : color.level_perfect
        : color.light_gray,
      ...this.props.style,
    };

    const perfectLevels = {
      ...styles.filler,
      backgroundColor: color.level_perfect,
      height: perfect,
      top: progressBoxSize - perfect,
    };

    const assessmentLevels = {
      ...styles.filler,
      backgroundColor: color.level_submitted,
      height: perfect,
      top: progressBoxSize - perfect,
    };

    const incompleteLevels = {
      ...styles.filler,
      backgroundColor: color.level_not_tried,
      height: incomplete,
    };

    const imperfectLevels = {
      ...styles.filler,
      backgroundColor: color.level_passed,
      height: imperfect,
    };

    const lessonNumberStyle = {
      ...styles.lessonNumber,
      color: perfect ? color.white : color.charcoal,
    };

    return (
      <div style={boxWithBorderStyle} data-testid="progress-box">
        {this.props.lessonNumber && (
          <div style={lessonNumberStyle}>{this.props.lessonNumber}</div>
        )}
        {viewed ? (
          <div style={viewedStyle} />
        ) : (
          <>
            <div style={incompleteLevels} />
            <div style={imperfectLevels} />
            <div
              className={'uitest-perfect-bar'}
              style={lessonIsAllAssessment ? assessmentLevels : perfectLevels}
            />
          </>
        )}
      </div>
    );
  }
}

const styles = {
  box: {
    height: REGULAR_PROGRESS_BOX_SIZE,
    width: REGULAR_PROGRESS_BOX_SIZE,
    borderWidth: 1,
    borderStyle: 'solid',
    boxSizing: 'content-box',
    position: 'relative',
  },
  filler: {
    width: REGULAR_PROGRESS_BOX_SIZE,
    position: 'absolute',
  },
  lessonNumber: {
    position: 'absolute',
    zIndex: 2,
    paddingTop: 2,
    textAlign: 'center',
    width: REGULAR_PROGRESS_BOX_SIZE,
    ...fontConstants['main-font-regular'],
  },
};
