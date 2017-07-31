import React from 'react';
import i18n from "@cdo/locale";
import color from "../../util/color";
import styleConstants from '../../styleConstants';
import experiments, {SECTION_FLOW_2017} from '@cdo/apps/util/experiments';
import AddSectionDialog from "../teacherDashboard/AddSectionDialog";
import Button from "../Button";
import {connect} from 'react-redux';
import {
  newSection,
  beginEditingNewSection
} from '../teacherDashboard/teacherSectionsRedux';

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
    newSection: React.PropTypes.func.isRequired,
    beginEditingNewSection: React.PropTypes.func.isRequired,
  },

  addSection: function () {
    if (experiments.isEnabled(SECTION_FLOW_2017)) {
      this.props.beginEditingNewSection();
    } else {
      return this.props.newSection();
    }
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
          <Button
            href="/courses"
            color={Button.ButtonColor.gray}
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
          {!experiments.isEnabled(SECTION_FLOW_2017) &&
            <Button
              href={sectionsUrl}
              color={Button.ButtonColor.gray}
              text={i18n.createSection()}
              style={isRtl ? styles.rtlButton : styles.button}
            />
          }
          {experiments.isEnabled(SECTION_FLOW_2017) &&
            <Button
              className="uitest-newsection"
              text={i18n.newSection()}
              style={styles.button}
              onClick={this.addSection}
              color={Button.ButtonColor.gray}
            />
          }
          <AddSectionDialog handleImportOpen={() => {/* TODO */}}/>
        </div>
      );
    }
  }
});

export default connect(undefined,{newSection,
  beginEditingNewSection})(SetUpMessage);

