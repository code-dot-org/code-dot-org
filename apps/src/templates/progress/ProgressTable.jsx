import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {categorizedLessons} from '@cdo/apps/code-studio/progressRedux';
import {lessonIsVisible} from '@cdo/apps/templates/progress/progressHelpers';
import SummaryProgressTable from './SummaryProgressTable';
import DetailProgressTable from './DetailProgressTable';
import ProgressGroup from './ProgressGroup';
import {levelType, lessonType} from './progressTypes';

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
        levels: PropTypes.arrayOf(PropTypes.arrayOf(levelType)).isRequired
      })
    ).isRequired,
    lessonIsVisible: PropTypes.func
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

  // Make this more clever. I don't need to find all of them, I just need to know if there is at least ONE visible lesson.
  checkVisibility = lessons => {
    lessons.filter(lesson => this.props.lessonIsVisible(lesson, 'Student'))
      .length;
  };

  render() {
    const {isSummaryView, isPlc, categorizedLessons} = this.props;

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
              hidden={this.checkVisibility(category.lessons)}
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
  categorizedLessons: categorizedLessons(state.progress),
  lessonIsVisible: (lesson, viewAs) => lessonIsVisible(lesson, state, viewAs)
}))(ProgressTable);
