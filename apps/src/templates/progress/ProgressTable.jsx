import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import SummaryProgressTable from './SummaryProgressTable';
import DetailProgressTable from './DetailProgressTable';
import LessonGroup from './LessonGroup';
import {lessonGroupType} from './progressTypes';

export const styles = {
  hidden: {
    display: 'none'
  }
};

class ProgressTable extends React.Component {
  static propTypes = {
    isPlc: PropTypes.bool.isRequired,
    isSummaryView: PropTypes.bool.isRequired,
    lessonGroups: PropTypes.arrayOf(lessonGroupType).isRequired,
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
    const {isSummaryView, isPlc, lessonGroups, minimal} = this.props;

    if (lessonGroups.length === 1) {
      // Render both tables, and toggle hidden state via CSS as this has better
      // perf implications than rendering just one at a time when toggling.
      return (
        <div>
          <div style={isSummaryView ? {} : styles.hidden}>
            <SummaryProgressTable
              lessons={lessonGroups[0].lessons}
              minimal={minimal}
            />
          </div>
          <div style={isSummaryView ? styles.hidden : {}}>
            <DetailProgressTable lessons={lessonGroups[0].lessons} />
          </div>
        </div>
      );
    } else {
      return (
        <div>
          {lessonGroups.map(group => (
            <LessonGroup
              key={group.displayName}
              isPlc={isPlc}
              lessonGroup={group}
              isSummaryView={isSummaryView}
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
  lessonGroups: state.progress.lessonGroups
}))(ProgressTable);
