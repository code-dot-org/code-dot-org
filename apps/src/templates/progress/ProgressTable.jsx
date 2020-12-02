import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {groupedLessons} from '@cdo/apps/code-studio/progressRedux';
import SummaryProgressTable from './SummaryProgressTable';
import DetailProgressTable from './DetailProgressTable';
import LessonGroup from './LessonGroup';
import {levelType, lessonType, lessonGroupType} from './progressTypes';

export const styles = {
  hidden: {
    display: 'none'
  }
};

class ProgressTable extends React.Component {
  static propTypes = {
    isPlc: PropTypes.bool.isRequired,
    isSummaryView: PropTypes.bool.isRequired,
    groupedLessons: PropTypes.arrayOf(
      PropTypes.shape({
        lessonGroup: lessonGroupType,
        lessons: PropTypes.arrayOf(lessonType).isRequired,
        levels: PropTypes.arrayOf(PropTypes.arrayOf(levelType)).isRequired
      })
    ).isRequired,
    minimal: PropTypes.bool
  };

  componentDidMount() {
    // TODO - This modifies things outside of our scope. This is done right now
    // because we only want to modify this (dashboard-owned) markup in the case
    // where an experiment is enabled (leading to this component being rendered).
    // Now that we're not behind an experiment for progressRedesign, we should make
    // these changes elsewhere.
    const padding = 80;
    $('.container.main').css({
      width: 'initial',
      maxWidth: 940 + 2 * padding,
      paddingLeft: padding,
      paddingRight: padding
    });
  }

  render() {
    const {isSummaryView, isPlc, groupedLessons, minimal} = this.props;

    if (groupedLessons.length === 1) {
      // Render both tables, and toggle hidden state via CSS as this has better
      // perf implications than rendering just one at a time when toggling.
      return (
        <div>
          <div style={isSummaryView ? {} : styles.hidden}>
            <SummaryProgressTable
              lessons={groupedLessons[0].lessons}
              levelsByLesson={groupedLessons[0].levels}
              minimal={minimal}
            />
          </div>
          <div style={isSummaryView ? styles.hidden : {}}>
            <DetailProgressTable
              lessons={groupedLessons[0].lessons}
              levelsByLesson={groupedLessons[0].levels}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div>
          {groupedLessons.map(group => (
            <LessonGroup
              key={group.lessonGroup.displayName}
              isPlc={isPlc}
              lessonGroup={group.lessonGroup}
              isSummaryView={isSummaryView}
              lessons={group.lessons}
              levelsByLesson={group.levels}
            />
          ))}
        </div>
      );
    }
  }
}

export const UnconnectedProgressTable = ProgressTable;
export default connect(state => ({
  isPlc: state.progress.professionalLearningCourse,
  isSummaryView: state.progress.isSummaryView,
  groupedLessons: groupedLessons(state.progress)
}))(ProgressTable);
