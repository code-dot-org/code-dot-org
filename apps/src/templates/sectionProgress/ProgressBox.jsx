import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '@cdo/apps/util/color';

const styles = {
  box: {
    height: 20,
    width: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    boxSizing: 'content-box'
  },
  filler: {
    width: 20
  }
};

export default class ProgressBox extends Component {
  static propTypes = {
    started: PropTypes.bool,
    incomplete: PropTypes.number,
    imperfect: PropTypes.number,
    perfect: PropTypes.number,
    style: PropTypes.object,
    stageIsAllAssessment: PropTypes.bool
  };

  render() {
    const {
      started,
      incomplete,
      imperfect,
      perfect,
      stageIsAllAssessment
    } = this.props;

    const boxWithBorderStyle = {
      ...styles.box,
      borderColor: started
        ? stageIsAllAssessment
          ? color.level_submitted
          : color.level_perfect
        : color.light_gray,
      ...this.props.style
    };

    const perfectLevels = {
      ...styles.filler,
      backgroundColor: color.level_perfect,
      height: perfect
    };

    const assessmentLevels = {
      ...styles.filler,
      backgroundColor: color.level_submitted,
      height: perfect
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

    return (
      <div style={boxWithBorderStyle}>
        <div style={incompleteLevels} />
        <div style={imperfectLevels} />
        <div
          className={'uitest-perfect-bar'}
          style={stageIsAllAssessment ? assessmentLevels : perfectLevels}
        />
      </div>
    );
  }
}
