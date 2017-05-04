import React from 'react';
import i18n from "@cdo/locale";
import color from "../../util/color";
import ProgressButton from "../progress/ProgressButton";

const styles = {
  section: {
    width: 960,
    backgroundColor: color.white,
    marginLeft: 25,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: color.border_gray,
    borderRadius: 2,
  },
  heading: {
    paddingLeft: 50,
    paddingTop: 80,
    paddingBottom: 20,
    fontSize: 38,
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.teal,
  },
  description: {
    paddingLeft: 50,
    paddingTop: 25,
    paddingBottom: 40,
    fontSize: 18,
    color: color.charcoal
  },
  button: {
    marginLeft: 50,
    marginBottom: 80
  }
};

const SetUpMessage = React.createClass({
  propTypes: {
    type: React.PropTypes.oneOf(['courses', 'sections']).isRequired
  },

  render() {
    const { type } = this.props;

    if (type === 'courses') {
      return (
        <div style={styles.section} >
          <div style={styles.heading}>
            {i18n.startLearning()}
          </div>
          <div style={styles.description}>
            {i18n.assignACourse()}
          </div>
          <ProgressButton href="view all the courses" color="gray" text={i18n.viewCourses()} style={styles.button}/>
        </div>
      );
    }
    if (type === 'sections') {
      return (
        <div style={styles.section} >
          <div style={styles.heading}>
            {i18n.setUpClassroom()}
          </div>
          <div style={styles.description}>
            {i18n.createNewClassroom()}
          </div>
          <ProgressButton href="wherever we go to create sections" color="gray" text={i18n.createSection()} style={styles.button}/>
        </div>
      );
    }
  }
});

export default SetUpMessage;
