import React, {Component} from 'react';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import color from '@cdo/apps/util/color';
import {navigationLessonShape} from '@cdo/apps/templates/lessonOverview/lessonPlanShapes';
import {linkWithQueryParams, navigateToHref} from '@cdo/apps/utils';

const styles = {
  dropdown: {
    display: 'inline-block'
  },
  boldText: {
    fontFamily: '"Gotham 7r", sans-serif'
  }
};

const LESSONS_PER_SECTION = 10;

/*
 Component used to navigate between lesson plans. When the list
 is longer than 11 lessons the list is broken into sections of
 10 lessons. Each section has its own item in the list. In addition
 one section of lessons will be open meaning that you will see
 those 10 lessons listed and can click to navigate to one of them.
 */

export default class LessonNavigationDropdown extends Component {
  static propTypes = {
    lesson: navigationLessonShape.isRequired
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

  handleDropdownClick = listItem => {
    if (listItem.link) {
      navigateToHref(linkWithQueryParams(listItem.link));
    } else {
      this.setState({currentSection: listItem.sectionNumber});
    }
  };

  /*
    Give a list of lessons will add an item for:
    1) Each set of 10 lessons
    2) Each lesson in the open section of lessons

    Example: You have 15 lessons and the second section is open. The
    list will look like:
    - Lessons 1 to 10
    - Lessons 10 to 15
    - Lesson 11
    - Lesson 12
    - Lesson 13
    - Lesson 14
    - Lesson 15
   */
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
          className="uitest-lesson-dropdown-nav"
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
