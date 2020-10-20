import React, {Component} from 'react';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import color from '@cdo/apps/util/color';
import {lessonShape} from '@cdo/apps/templates/lessonOverview/lessonPlanShapes';

const styles = {
  dropdown: {
    display: 'inline-block'
  },
  boldText: {
    fontFamily: '"Gotham 7r", sans-serif'
  }
};

const LESSONS_PER_SECTION = 10;

export default class LessonNavigationDropdown extends Component {
  static propTypes = {
    lesson: lessonShape.isRequired
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
      window.location.href = this.linkWithQueryParams(listItem.link);
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
        for (
          let j = numfirstLessonInSection - 1;
          j < numLastLessonInSection;
          j++
        ) {
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
              className={listItem.link ? 'navigate' : 'no-navigation'} // Used to specify if the dropdown should collapse when clicked
              style={
                listItem.link
                  ? {fontFamily: '"Gotham 4r", sans-serif'}
                  : {
                      fontFamily: '"Gotham 4r", sans-serif',
                      backgroundColor: color.lightest_purple
                    }
              }
            >
              {listItem.link && (
                <span style={{marginLeft: 10}}>
                  <span
                    style={{
                      ...{margin: '0px 2px'},
                      ...(listItem.key === lesson.key && styles.boldText)
                    }}
                  >
                    {`${listItem.position} - ${listItem.displayName}`}
                  </span>
                </span>
              )}
              {!listItem.link && <span>{listItem.displayName}</span>}
            </a>
          ))}
        </DropdownButton>
      </div>
    );
  }
}
