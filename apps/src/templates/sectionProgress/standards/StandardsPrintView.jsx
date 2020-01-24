import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {connect} from 'react-redux';
import {
  getCurrentScriptData,
  scriptDataPropType
} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import {
  getSelectedScriptFriendlyName,
  getSelectedScriptDescription
} from '@cdo/apps/redux/scriptSelectionRedux';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import StandardsProgressTable from './StandardsProgressTable';
import {sectionName} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {
  getNumberLessonsCompleted,
  getNumberLessonsInCourse
} from './sectionStandardsProgressRedux';
import StandardsLegendForPrint from './StandardsLegendForPrint';
import StandardsReportCurrentCourseInfo from './StandardsReportCurrentCourseInfo';
import StandardsReportHeader from './StandardsReportHeader';
import color from '@cdo/apps/util/color';

const styles = {
  printView: {
    width: 1000,
    backgroundColor: color.white
  },
  headerColor: {
    color: color.purple
  },
  footer: {
    backgroundColor: color.purple,
    color: color.white
  },
  reportContent: {
    margin: '0px 50px'
  },
  mission: {
    padding: '10px 25px',
    fontSize: 11
  },
  table: {
    width: '100%'
  }
};

class StandardsPrintView extends Component {
  static propTypes = {
    //redux
    section: sectionDataPropType.isRequired,
    scriptFriendlyName: PropTypes.string.isRequired,
    scriptData: scriptDataPropType,
    teacherName: PropTypes.string,
    sectionName: PropTypes.string,
    teacherComment: PropTypes.string,
    scriptDescription: PropTypes.string.isRequired,
    numStudentsInSection: PropTypes.number,
    numLessonsCompleted: PropTypes.number,
    numLessonsInUnit: PropTypes.number
  };

  getLinkToOverview() {
    const {scriptData, section} = this.props;
    return scriptData ? `${scriptData.path}?section_id=${section.id}` : null;
  }

  render() {
    const {scriptFriendlyName} = this.props;
    const linkToOverview = this.getLinkToOverview();
    return (
      <div style={styles.printView}>
        <StandardsReportHeader
          sectionName={this.props.sectionName}
          teacherName={this.props.teacherName}
        />
        <div style={styles.reportContent}>
          <h2 style={styles.headerColor}>{i18n.currentCourse()}</h2>
          <StandardsReportCurrentCourseInfo
            section={this.props.section}
            scriptFriendlyName={this.props.scriptFriendlyName}
            scriptData={this.props.scriptData}
            scriptDescription={this.props.scriptDescription}
            numStudentsInSection={this.props.numStudentsInSection}
            numLessonsCompleted={this.props.numLessonsCompleted}
            numLessonsInUnit={this.props.numLessonsInUnit}
          />
          {this.props.teacherComment && (
            <div>
              <h2 style={styles.headerColor}>{i18n.teacherComments()}</h2>
              <p>{this.props.teacherComment}</p>
            </div>
          )}
          <h2 style={styles.headerColor}>{i18n.CSTAStandardsPracticed()}</h2>
          <StandardsProgressTable style={styles.table} />
          <StandardsLegendForPrint />
          <h2 style={styles.headerColor}>{i18n.standardsHowToForPrint()}</h2>
          <SafeMarkdown
            openExternalLinksInNewTab={true}
            markdown={i18n.standardsHowToDetailsForPrint({
              courseName: scriptFriendlyName,
              courseLink: linkToOverview,
              cstaLink: 'https://www.csteachers.org/page/standards'
            })}
          />
          <h2 style={styles.headerColor}>{i18n.standardsGetInvolved()}</h2>
          <SafeMarkdown
            markdown={i18n.standardsGetInvolvedDetailsForPrint({
              adminLink: pegasus('/administrator'),
              parentLink: pegasus('/help'),
              teacherLink: '/courses'
            })}
          />
        </div>
        <div style={styles.footer}>
          <p style={styles.mission}>
            <SafeMarkdown markdown={i18n.missionStatement()} />
          </p>
        </div>
      </div>
    );
  }
}

export const UnconnectedStandardsPrintView = StandardsPrintView;

export default connect(state => ({
  section: state.sectionData.section,
  scriptData: getCurrentScriptData(state),
  scriptFriendlyName: getSelectedScriptFriendlyName(state),
  scriptDescription: getSelectedScriptDescription(state),
  numStudentsInSection: state.sectionData.section.students.length,
  teacherComment: state.sectionStandardsProgress.teacherComment,
  teacherName: state.currentUser.userName,
  sectionName: sectionName(state, state.sectionData.section.id),
  numLessonsCompleted: getNumberLessonsCompleted(state),
  numLessonsInUnit: getNumberLessonsInCourse(state)
}))(StandardsPrintView);
