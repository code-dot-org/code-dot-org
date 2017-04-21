import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';

import { stageShape } from './types';
import StageProgress from './StageProgress';
import TeacherStageInfo from './TeacherStageInfo';
import { ViewType } from '../../stageLockRedux';
import { isHiddenForSection } from '../../hiddenStageRedux';
import color from "../../../util/color";

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
    width: '100%',
    display: 'table',
    // without this, IE doesnt size descendants that are at 100% height correctly
    minHeight: 1,
  },
  teacherRow: {
    margin: '14px 0'
  },
  hiddenRow: {
    display: 'none'
  },
  teacherHiddenRow: {
    background: 'white',
    borderStyle: 'dashed'
  },
  focusAreaRow: {
    height: 110,
    borderWidth: 3,
    background: color.almost_white_cyan,
    borderColor: color.cyan,
    padding: '8px 8px 20px 8px'
  },
  stageName: {
    display: 'table-cell',
    width: 200,
    verticalAlign: 'middle',
    padding: 10
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
    right: -31,
    fontSize: 12,
    whiteSpace: 'nowrap',
    background: color.cyan,
    color: color.white,
    padding: '5px 25px',
    transform: 'rotate(45deg)'
  },
  changeFocusArea: {
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.dark_charcoal,
    position: 'absolute',
    right: 5,
    bottom: 5
  },
  changeFocusAreaIcon: {
    fontSize: '1.2em',
    marginRight: 6
  },
  stageProgress: {
    display: 'table-cell',
    padding: 10,
    verticalAlign: 'middle'
  },
  teacherInfo: {
    display: 'table-cell',
    verticalAlign: 'top',
    width: 240,
  }
};

/**
 * Stage progress component used in level header and course overview.
 */
const CourseProgressRow = React.createClass({
  propTypes: {
    stage: stageShape,
    professionalLearningCourse: React.PropTypes.bool,
    isFocusArea: React.PropTypes.bool,

    // redux provided
    sectionId: React.PropTypes.string,
    hiddenStageState: React.PropTypes.object.isRequired,
    showTeacherInfo: React.PropTypes.bool,
    viewAs: React.PropTypes.oneOf(Object.values(ViewType)).isRequired,
    lockableAuthorized: React.PropTypes.bool.isRequired,
    changeFocusAreaPath: React.PropTypes.string,
  },

  render() {
    const { stage, sectionId, hiddenStageState, lockableAuthorized } = this.props;
    if (stage.lockable && !lockableAuthorized) {
      return null;
    }

    const isHidden = isHiddenForSection(hiddenStageState, sectionId, stage.id);

    return (
      <div
        className={stage.lockable && lockableAuthorized ? "uitest-locked" : ""}
        style={[
          styles.row,
          this.props.professionalLearningCourse && {background: color.white},
          this.props.isFocusArea && styles.focusAreaRow,
          isHidden && this.props.viewAs === ViewType.Student && styles.hiddenRow,
          isHidden && this.props.viewAs === ViewType.Teacher && styles.teacherHiddenRow,
          this.props.viewAs === ViewType.Teacher && styles.teacherRow
        ]}
      >
        {this.props.isFocusArea && [
          <div style={styles.ribbonWrapper} key="ribbon">
            <div style={styles.ribbon}>Focus Area</div>
          </div>,
          <a
            href={this.props.changeFocusAreaPath}
            style={styles.changeFocusArea}
            key="changeFocusArea"
          >
            <i className="fa fa-pencil" style={styles.changeFocusAreaIcon} />
            <span>Change your focus area</span>
          </a>
        ]}
        <div style={styles.stageName}>
          {this.props.professionalLearningCourse ? stage.name : stage.title}
        </div>
        <div style={styles.stageProgress}>
          <StageProgress
            stageId={stage.id}
            levels={stage.levels}
            courseOverviewPage={true}
          />
        </div>
        {this.props.showTeacherInfo && this.props.viewAs === ViewType.Teacher &&
          <div style={styles.teacherInfo}>
            <TeacherStageInfo stage={stage}/>
          </div>
        }
      </div>
    );
  }
});

export default connect(state => {
  return {
    sectionId: state.sections.selectedSectionId,
    hiddenStageState: state.hiddenStage,
    showTeacherInfo: state.progress.showTeacherInfo,
    viewAs: state.stageLock.viewAs,
    lockableAuthorized: state.stageLock.lockableAuthorized,
    changeFocusAreaPath: state.progress.changeFocusAreaPath,
  };
})(Radium(CourseProgressRow));
