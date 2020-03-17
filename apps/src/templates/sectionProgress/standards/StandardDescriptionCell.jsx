import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip';
import i18n from '@cdo/locale';
import ProgressBoxForLessonNumber from './ProgressBoxForLessonNumber';

const styles = {
  main: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  description: {
    marginBottom: 10
  },
  lessonsArea: {
    display: 'flex',
    flexDirection: 'row'
  },
  lessonBoxes: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  lessonBox: {
    marginBottom: 10
  },
  lessonsAreaTitle: {
    marginRight: 10,
    width: '30%'
  },
  tooltip: {
    textAlign: 'center'
  },
  tooltipLessonName: {
    fontFamily: '"Gotham 7r", sans-serif'
  }
};

class StandardDescriptionCell extends Component {
  static propTypes = {
    description: PropTypes.string,
    lessonsForStandardStatus: PropTypes.array,
    isViewingReport: PropTypes.bool
  };

  getLessonBoxes = () => {
    if (this.props.lessonsForStandardStatus) {
      return this.props.lessonsForStandardStatus.map((lesson, index) => {
        const percentComplete =
          Math.round(lesson.numStudentsCompleted / lesson.numStudents) * 100;
        return (
          <span key={lesson.name} style={styles.lessonBox}>
            {!this.props.isViewingReport && (
              <ReactTooltip
                id={lesson.name}
                key={lesson.name}
                role="tooltip"
                wrapper="span"
                effect="solid"
                place="top"
              >
                <div style={styles.tooltip}>
                  <div style={styles.tooltipLessonName}>{lesson.name}</div>
                  <div>
                    {lesson.unplugged ? i18n.unplugged() : i18n.plugged()}
                  </div>
                  <div>
                    {lesson.completed ? i18n.completed() : i18n.notCompleted()}
                  </div>
                  <div>
                    {i18n.completedStudentCount({
                      numStudentsCompleted: lesson.numStudentsCompleted,
                      numStudents: lesson.numStudents,
                      percentComplete: percentComplete
                    })}
                  </div>
                </div>
              </ReactTooltip>
            )}
            <ProgressBoxForLessonNumber
              key={lesson.lessonNumber}
              completed={lesson.completed}
              lessonNumber={lesson.lessonNumber}
              tooltipId={lesson.name}
              linkToLessonPlan={lesson.url}
            />
          </span>
        );
      });
    } else {
      return;
    }
  };

  getNumberLessons = () => {
    if (this.props.lessonsForStandardStatus) {
      return this.props.lessonsForStandardStatus.length;
    } else {
      return 0;
    }
  };

  render() {
    return (
      <div style={styles.main}>
        <div style={styles.description}>{this.props.description}</div>
        <div style={styles.lessonsArea}>
          <span style={styles.lessonsAreaTitle}>
            {i18n.availableLessons({numLessons: this.getNumberLessons()})}
          </span>
          <div style={styles.lessonBoxes}>{this.getLessonBoxes()}</div>
        </div>
      </div>
    );
  }
}

export default StandardDescriptionCell;
