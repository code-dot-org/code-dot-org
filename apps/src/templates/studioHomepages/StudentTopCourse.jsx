import React from 'react';
import i18n from "@cdo/locale";
import color from "../../util/color";
import ProgressButton from '../progress/ProgressButton';

const styles = {
  card: {
    overflow: 'hidden',
    border: '1px solid gray',
    position: 'relative',
    height: 200,
    width: 970,
    float: 'left',
    marginBottom: 20,
    background: color.white,
  },
  image: {
    position: 'absolute',
    width: 970,
    height: 80
  },
  name: {
    paddingTop: 10,
    paddingBottom: 5,
    marginTop: 15,
    fontSize: 30,
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.white,
    zIndex: 2,
    position: 'absolute',
    display: 'inline',
    paddingLeft: 25,
    paddingRight: 10,
  },
  description: {
    paddingLeft: 25,
    paddingRight: 25,
    paddingTop: 20,
    paddingBottom: 5,
    marginTop: 80,
    fontSize: 16,
    lineHeight: 1.5,
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.charcoal,
    background: color.white,
    width: "65%",
    boxSizing: "border-box",
    position: 'absolute',
    zIndex: 2,
  },
  buttonBox: {
    float: 'right',
    marginTop: 120,
    zIndex: 2,
  },
  lessonButton: {
    marginLeft: 20,
    marginRight: 25
  },
};

// While this is named a StudentTopCourse, it really refers to the most recent course or script in which the student has progress.

const StudentTopCourse = React.createClass({
  propTypes: {
    isRtl: React.PropTypes.bool.isRequired,
    assignableName: React.PropTypes.string.isRequired,
    lessonName: React.PropTypes.string.isRequired,
    linkToOverview: React.PropTypes.string.isRequired,
    linkToLesson: React.PropTypes.string.isRequired
  },

  render() {
    const { assignableName, lessonName, linkToOverview, linkToLesson } = this.props;
    return (
      <div style={styles.card}>
        <img src={require('@cdo/static/small_purple_icons.png')} style={styles.image}/>
        <div style={styles.name}>
          {i18n.topCourseWelcome({assignableName})}
        </div>
        <div style={styles.description}>
          <div>
            {i18n.topCourseLessonIntro({lessonName})}
          </div>
          <div style={{marginTop: 10}}>
            {i18n.topCourseExplanation()}
          </div>
        </div>
        <div style={styles.buttonBox}>
          <ProgressButton
            href={linkToOverview}
            color={ProgressButton.ButtonColor.gray}
            text={i18n.viewCourse()}
          />
          <ProgressButton
            href={linkToLesson}
            color={ProgressButton.ButtonColor.orange}
            text={i18n.continueLesson()}
            style={styles.lessonButton}
          />
        </div>
      </div>
    );
  }
});

export default StudentTopCourse;
