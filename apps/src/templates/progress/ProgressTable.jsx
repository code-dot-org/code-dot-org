import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { categorizedLessons } from '@cdo/apps/code-studio/progressRedux';
import SummaryProgressTable from './SummaryProgressTable';
import DetailProgressTable from './DetailProgressTable';
import ProgressGroup from './ProgressGroup';
import { levelType, lessonType } from './progressTypes';

export const styles = {
  hidden: {
    display: 'none'
  }
};

class ProgressTable extends React.Component {
  static propTypes = {
    isPlc: PropTypes.bool.isRequired,
    isSummaryView: PropTypes.bool.isRequired,
    categorizedLessons: PropTypes.arrayOf(
      PropTypes.shape({
        category: PropTypes.string.isRequired,
        lessons: PropTypes.arrayOf(lessonType).isRequired,
        levels: PropTypes.arrayOf(
          PropTypes.arrayOf(levelType)
        ).isRequired
      })
    ).isRequired,
  };

  componentDidMount() {
    // TODO - This modifies things outside of our scope. This is done right now
    // because we only want to modify this (dashboard-owned) markup in the case
    // where an experiment is enabled (leading to this component being rendered).
    // Now that we're not behind an experiment for progressRedesign, we should make
    // these changes elsewhere.
    const padding = 80;
    $(".container.main").css({
      width: 'initial',
      maxWidth: 940 + 2 * padding,
      paddingLeft: padding,
      paddingRight:padding
    });
  }

  render() {
    const { isSummaryView, isPlc, categorizedLessons } = this.props;

    if (categorizedLessons.length === 1) {
      // Render both tables, and toggle hidden state via CSS as this has better
      // perf implications than rendering just one at a time when toggling.
      return (
        <div>
          <div style={isSummaryView ? {} : styles.hidden}>
            <SummaryProgressTable
              lessons={categorizedLessons[0].lessons}
              levelsByLesson={categorizedLessons[0].levels}
            />
          </div>
          <div style={isSummaryView ? styles.hidden : {}}>
            <DetailProgressTable
              lessons={categorizedLessons[0].lessons}
              levelsByLesson={categorizedLessons[0].levels}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div>
          {categorizedLessons.map(category => (
            <ProgressGroup
              key={category.category}
              isPlc={isPlc}
              groupName={category.category}
              isSummaryView={isSummaryView}
              lessons={category.lessons}
              levelsByLesson={category.levels}
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
  categorizedLessons: categorizedLessons(state.progress)
}))(ProgressTable);
