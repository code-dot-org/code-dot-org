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

/*
 Component used to navigate between lesson plans. List
 is broken into sections based on Lesson Groups. Each section has its own item in the list.
 In addition one section of lessons will be open meaning that you will see
 those the lessons in that lesson group listed and can click to navigate to one of them.
 */

export default class LessonNavigationDropdown extends Component {
  static propTypes = {
    lesson: navigationLessonShape.isRequired
  };

  constructor(props) {
    super(props);

    const sectionOfCurrentLesson =
      props.lesson.unit.lessonGroups.findIndex(lg =>
        lg.lessons.some(l => l.key === props.lesson.key)
      ) + 1;

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
    Give a list of lesson groups and lessons will add an item for:
    1) Each lesson group
    2) Each lesson in the open lesson group

    Example: You have 2 lesson groups and the second lesson group section is open. The
    list will look something like:
    - Lesson Group 1
    - Lesson Group 2
    - Lesson 11
    - Lesson 12
    - Lesson 13
    - Lesson 14
    - Lesson 15
   */
  createSectionsOfLessons = () => {
    const {lesson} = this.props;

    const sectionsAndLessons = [];
    lesson.unit.lessonGroups.forEach((lessonGroup, index) => {
      sectionsAndLessons.push({
        displayName: lessonGroup.userFacing
          ? lessonGroup.displayName
          : i18n.lessons(),
        sectionNumber: index + 1
      });
      if (index + 1 === this.state.currentSection) {
        lessonGroup.lessons.forEach(lesson => {
          sectionsAndLessons.push(lesson);
        });
      }
    });

    return sectionsAndLessons;
  };

  render() {
    const {lesson} = this.props;

    const lessonsList = this.createSectionsOfLessons();

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
