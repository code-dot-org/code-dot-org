import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import DropdownButton from '@cdo/apps/templates/DropdownButton';

const styles = {
  dropdown: {
    display: 'inline-block'
  }
};

const LESSONS_PER_SECTION = 10;

export default class LessonNavigationDropdown extends Component {
  static propTypes = {
    lesson: PropTypes.shape({
      unit: PropTypes.shape({
        displayName: PropTypes.string.isRequired,
        link: PropTypes.string.isRequired,
        lessons: PropTypes.arrayOf(
          PropTypes.shape({
            displayName: PropTypes.string.isRequired,
            link: PropTypes.string.isRequired,
            key: PropTypes.string.isRequired
          })
        ).isRequired
      }).isRequired,
      key: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
      overview: PropTypes.string.isRequired,
      purpose: PropTypes.string.isRequired,
      preparation: PropTypes.string.isRequired
    }).isRequired
  };

  constructor(props) {
    super(props);

    const currentLessonNumber =
      props.lesson.unit.lessons.findIndex(l => l.key === props.lesson.key) + 1;
    const sectionOfCurrentLesson = Math.ceil(
      currentLessonNumber / LESSONS_PER_SECTION.toFixed(1)
    );

    this.state = {
      currentSection: sectionOfCurrentLesson
    };
  }

  linkWithQueryParams = link => {
    const queryParams = window.location.search || '';
    return link + queryParams;
  };

  handleDropdownClick = listItem => {
    if (listItem.link) {
      window.location.href = listItem.link;
    } else {
      this.setState({currentSection: listItem.sectionNumber});
    }
  };

  createSectionsOfLessons = () => {
    const {lesson} = this.props;
    const numLessons = lesson.unit.lessons.length;
    const numSections = Math.ceil(numLessons / LESSONS_PER_SECTION.toFixed(1));

    const sectionsAndLessons = [];
    for (let i = 0; i < numSections; i++) {
      const numfirstLessonInSection = i * LESSONS_PER_SECTION + 1;
      const numLastLessonInSection =
        numLessons > i * LESSONS_PER_SECTION + LESSONS_PER_SECTION
          ? i * LESSONS_PER_SECTION + LESSONS_PER_SECTION
          : numLessons;

      sectionsAndLessons.push({
        displayName: `Lessons ${numfirstLessonInSection} to ${numLastLessonInSection}`,
        sectionNumber: i + 1
      });

      if (i + 1 === this.state.currentSection) {
        for (let j = numfirstLessonInSection; j < numLastLessonInSection; j++) {
          sectionsAndLessons.push(lesson.unit.lessons[j]);
        }
      }
    }

    return sectionsAndLessons;
  };

  render() {
    const {lesson} = this.props;

    const lessonsList =
      lesson.unit.lessons.length < 12
        ? lesson.unit.lessons
        : this.createSectionsOfLessons();

    return (
      <div style={styles.dropdown}>
        <DropdownButton
          text={i18n.otherLessonsInUnit()}
          color={Button.ButtonColor.purple}
        >
          {lessonsList.map((listItem, index) => (
            <a
              key={index}
              onClick={this.handleDropdownClick.bind(this, listItem)}
            >
              {`${listItem.displayName}`}
            </a>
          ))}
        </DropdownButton>
      </div>
    );
  }
}
