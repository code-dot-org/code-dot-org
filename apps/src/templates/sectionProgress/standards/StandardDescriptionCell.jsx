import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ProgressBox from '@cdo/apps/templates/sectionProgress/ProgressBox';
import i18n from '@cdo/locale';

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
  lessonsAreaTitle: {
    marginRight: 10
  },
  lessonBox: {
    marginRight: 10
  }
};

class StandardDescriptionCell extends Component {
  static propTypes = {
    description: PropTypes.string,
    lessonsForStandardStatus: PropTypes.array
  };

  getLessonBoxes = () => {
    if (this.props.lessonsForStandardStatus) {
      return this.props.lessonsForStandardStatus.map((lesson, index) => {
        if (lesson.status === 'done') {
          return (
            <ProgressBox
              key={lesson.id}
              style={styles.lessonBox}
              started={true}
              incomplete={0}
              imperfect={0}
              perfect={20}
              showLessonNumber
              lessonNumber={lesson.id}
            />
          );
        } else {
          return (
            <ProgressBox
              key={lesson.id}
              style={styles.lessonBox}
              started={false}
              incomplete={20}
              imperfect={0}
              perfect={0}
              showLessonNumber
              lessonNumber={lesson.id}
            />
          );
        }
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
          {this.getLessonBoxes()}
        </div>
      </div>
    );
  }
}

export default StandardDescriptionCell;
