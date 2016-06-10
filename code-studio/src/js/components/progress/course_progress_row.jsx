/* global dashboard */
import React from 'react';
import { connect } from 'react-redux';
import { stageShape } from './types';
import StageProgress from './stage_progress.jsx';
import color from '../../color';

const styles = {
  row: {
    position: 'relative',
    boxSizing: 'border-box',
    margin: '2px 0',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    borderRadius: 5,
    background: color.lightest_gray,
    display: 'table',
    padding: 10,
    width: '100%'
  },
  focusAreaRow: {
    minHeight: 105,
    borderWidth: 3,
    background: color.almost_white_cyan,
    borderColor: color.cyan,
    padding: 8
  },
  stageName: {
    display: 'table-cell',
    width: 200,
    verticalAlign: 'middle',
    paddingRight: 10
  },
  ribbonWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 90,
    height: 90,
    overflow: 'hidden'
  },
  ribbon: {
    fontFamily: '"Gotham 5r", sans-serif',
    position: 'absolute',
    top: 16,
    right: -32,
    fontSize: 12,
    whiteSpace: 'nowrap',
    background: color.cyan,
    color: color.white,
    padding: '5px 25px',
    transform: 'rotate(45deg)'
  },
  changeFocusArea: {
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.black,
    position: 'absolute',
    right: 5,
    bottom: 5
  }
};

/**
 * Stage progress component used in level header and course overview.
 */
const CourseProgressRow = React.createClass({
  propTypes: {
    currentLevelId: React.PropTypes.string,
    professionalLearningCourse: React.PropTypes.bool,
    isFocusArea: React.PropTypes.bool,
    stage: stageShape
  },

  render() {
    const stage = this.props.stage;

    let rowStyle = Object.assign({}, styles.row);
    let ribbon, changeFocusArea;
    if (this.props.professionalLearningCourse) {
      Object.assign(rowStyle, {background: color.white});
    }
    if (this.props.isFocusArea) {
      Object.assign(rowStyle, styles.focusAreaRow);
      ribbon = <div style={styles.ribbonWrapper}><div style={styles.ribbon}>Focus Area</div></div>;
      changeFocusArea = (
        <a href={this.props.changeFocusAreaPath} style={styles.changeFocusArea}>
          <i className='fa fa-pencil' /> Change your focus area
        </a>
      );
    }

    return (
      <div style={rowStyle}>
        {ribbon}
        {changeFocusArea}
        <div style={styles.stageName}>
          {this.props.professionalLearningCourse ? stage.name : stage.title}
          <div className='stage-lesson-plan-link' style={{display: 'none'}}>
            <a target='_blank' href={stage.lesson_plan_html_url}>
              {dashboard.i18n.t('view_lesson_plan')}
            </a>
          </div>
        </div>
        <StageProgress levels={stage.levels} currentLevelId={this.props.currentLevelId} largeDots={true} saveAnswersFirst={false} />
      </div>
    );
  }
});

export default connect(state => ({
  changeFocusAreaPath: state.changeFocusAreaPath
}))(CourseProgressRow);
