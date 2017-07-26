import React from 'react';
import i18n from "@cdo/locale";
import color from "../../util/color";
import styleConstants from '../../styleConstants';
import ProgressButton from "../progress/ProgressButton";
import experiments from '@cdo/apps/util/experiments';
import AddSectionDialog from "../teacherDashboard/AddSectionDialog";

const styles = {
  section: {
    width: styleConstants['content-width'],
    backgroundColor: color.white,
    borderStyle: 'dashed',
    borderWidth: 5,
    borderColor: color.border_gray,
    boxSizing: "border-box"
  },
  heading: {
    paddingLeft: 50,
    paddingTop: 80,
    paddingBottom: 20,
    fontSize: 38,
    fontFamily: 'Gotham 5r',
    color: color.teal,
  },
  rtlHeading: {
    paddingRight: 50,
    paddingTop: 80,
    paddingBottom: 20,
    fontSize: 38,
    fontFamily: 'Gotham 5r',
    color: color.teal,
  },
  description: {
    paddingLeft: 50,
    paddingTop: 25,
    paddingBottom: 40,
    fontSize: 18,
    color: color.charcoal
  },
  rtlDescription: {
    paddingRight: 50,
    paddingTop: 25,
    paddingBottom: 40,
    fontSize: 18,
    color: color.charcoal
  },
  button: {
    marginLeft: 50,
    marginBottom: 80
  },
  rtlButton: {
    marginRight: 50,
    marginBottom: 80
  }
};

const SetUpMessage = React.createClass({
  propTypes: {
    type: React.PropTypes.oneOf(['courses', 'sections']).isRequired,
    codeOrgUrlPrefix: React.PropTypes.string,
    isRtl: React.PropTypes.bool.isRequired,
    isTeacher: React.PropTypes.bool.isRequired,
  },

  getInitialState() {
    return {addSectionDialogOpen: false};
  },

  addSection(){
    this.setState({addSectionDialogOpen: true});
  },

  handleCloseAddSectionDialogs(){
    this.setState({addSectionDialogOpen: false});
  },

  render() {
    const { type, codeOrgUrlPrefix, isRtl, isTeacher } = this.props;
    const sectionsUrl = `${codeOrgUrlPrefix}/teacher-dashboard#/sections`;

    if (type === 'courses') {
      return (
        <div style={styles.section} >
          <div style={isRtl ? styles.rtlHeading : styles.heading}>
            {i18n.startLearning()}
          </div>
          {isTeacher && (
            <div style={isRtl ? styles.rtlDescription : styles.description}>
              {i18n.setupCoursesTeacher()}
            </div>
          )}
          {!isTeacher && (
            <div style={isRtl ? styles.rtlDescription : styles.description}>
              {i18n.setupCoursesStudent()}
            </div>
          )}
          <ProgressButton
            href="/courses"
            color={ProgressButton.ButtonColor.gray}
            text={i18n.findCourse()}
            style={isRtl ? styles.rtlButton : styles.button}
          />
        </div>
      );
    }
    if (type === 'sections') {
      return (
        <div style={styles.section} >
          <div style={isRtl ? styles.rtlHeading : styles.heading}>
            {i18n.setUpClassroom()}
          </div>
          <div style={isRtl ? styles.rtlDescription : styles.description}>
            {i18n.createNewClassroom()}
          </div>
          {!experiments.isEnabled('section-flow-2017') &&
            <ProgressButton
              href={sectionsUrl}
              color={ProgressButton.ButtonColor.gray}
              text={i18n.createSection()}
              style={isRtl ? styles.rtlButton : styles.button}
            />
          }
          {experiments.isEnabled('section-flow-2017') &&
          <ProgressButton
            className="uitest-newsection"
            text={i18n.newSection()}
            style={styles.button}
            onClick={this.addSection}
            color={ProgressButton.ButtonColor.gray}
          />
          }
          <AddSectionDialog
            isOpen={this.state.addSectionDialogOpen}
            handleClose={this.handleCloseAddSectionDialogs}
          />
        </div>
      );
    }
  }
});

export default SetUpMessage;
