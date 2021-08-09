import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '@cdo/apps/util/color';

const PROGRESS_BOX_SIZE = 20;

export default class ProgressBox extends Component {
  static propTypes = {
    started: PropTypes.bool,
    incomplete: PropTypes.number,
    imperfect: PropTypes.number,
    perfect: PropTypes.number,
    style: PropTypes.object,
    lessonIsAllAssessment: PropTypes.bool,
    lessonNumber: PropTypes.number
  };

  render() {
    const {
      started,
      incomplete,
      imperfect,
      perfect,
      lessonIsAllAssessment
    } = this.props;

    const boxWithBorderStyle = {
      ...styles.box,
      borderColor: started
        ? lessonIsAllAssessment
          ? color.level_submitted
          : color.level_perfect
        : color.light_gray,
      ...this.props.style
    };

    const perfectLevels = {
      ...styles.filler,
      backgroundColor: color.level_perfect,
      height: perfect,
      top: PROGRESS_BOX_SIZE - perfect
    };

    const assessmentLevels = {
      ...styles.filler,
      backgroundColor: color.level_submitted,
      height: perfect,
      top: PROGRESS_BOX_SIZE - perfect
    };

    const incompleteLevels = {
      ...styles.filler,
      backgroundColor: color.level_not_tried,
      height: incomplete
    };

    const imperfectLevels = {
      ...styles.filler,
      backgroundColor: color.level_passed,
      height: imperfect
    };

    const lessonNumberStyle = {
      ...styles.lessonNumber,
      color: perfect ? color.white : color.charcoal
    };
    return (
      <div style={boxWithBorderStyle}>
        {this.props.lessonNumber && (
          <div style={lessonNumberStyle}>{this.props.lessonNumber}</div>
        )}
        <div style={incompleteLevels} />
        <div style={imperfectLevels} />
        <div
          className={'uitest-perfect-bar'}
          style={lessonIsAllAssessment ? assessmentLevels : perfectLevels}
        />
      </div>
    );
  }
}

const styles = {
  box: {
    height: PROGRESS_BOX_SIZE,
    width: PROGRESS_BOX_SIZE,
    borderWidth: 1,
    borderStyle: 'solid',
    boxSizing: 'content-box',
    position: 'relative'
  },
  filler: {
    width: PROGRESS_BOX_SIZE,
    position: 'absolute'
  },
  lessonNumber: {
    position: 'absolute',
    zIndex: 2,
    paddingTop: 2,
    textAlign: 'center',
    width: PROGRESS_BOX_SIZE,
    fontFamily: '"Gotham 4r", sans-serif'
  }
};
