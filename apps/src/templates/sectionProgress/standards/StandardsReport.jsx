import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {connect} from 'react-redux';
import {getCurrentScriptData} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import {scriptDataPropType} from '../sectionProgressConstants';
import {
  getSelectedScriptFriendlyName,
  getSelectedScriptDescription,
  setScriptId
} from '@cdo/apps/redux/scriptSelectionRedux';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import StandardsProgressTable from './StandardsProgressTable';
import {sectionName} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {
  getNumberLessonsCompleted,
  getNumberLessonsInScript,
  setTeacherCommentForReport,
  lessonsByStandard
} from './sectionStandardsProgressRedux';
import StandardsLegend from './StandardsLegend';
import StandardsReportCurrentCourseInfo from './StandardsReportCurrentCourseInfo';
import StandardsReportHeader from './StandardsReportHeader';
import color from '@cdo/apps/util/color';
import _ from 'lodash';
import {loadScriptProgress} from '../sectionProgressLoader';
import PrintReportButton from './PrintReportButton';
import {cstaStandardsURL} from './standardsConstants';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

class StandardsReport extends Component {
  static propTypes = {
    //redux
    scriptId: PropTypes.number,
    section: sectionDataPropType.isRequired,
    scriptFriendlyName: PropTypes.string.isRequired,
    scriptData: scriptDataPropType,
    teacherName: PropTypes.string,
    sectionName: PropTypes.string,
    teacherComment: PropTypes.string,
    scriptDescription: PropTypes.string.isRequired,
    numStudentsInSection: PropTypes.number,
    numLessonsCompleted: PropTypes.number,
    numLessonsInUnit: PropTypes.number,
    setTeacherCommentForReport: PropTypes.func.isRequired,
    setScriptId: PropTypes.func.isRequired,
    lessonsByStandard: PropTypes.object
  };

  componentDidMount() {
    this.props.setTeacherCommentForReport(
      window.opener.teacherDashboardStoreInformation.teacherComment
    );
    const scriptIdFromTD =
      window.opener.teacherDashboardStoreInformation.scriptId;
    this.props.setScriptId(scriptIdFromTD);
    loadScriptProgress(scriptIdFromTD, this.props.section.id);
  }

  getLinkToOverview() {
    const {scriptData, section} = this.props;
    return scriptData ? `${scriptData.path}?section_id=${section.id}` : null;
  }

  printReport = () => {
    const printArea = document.getElementById('printArea').outerHTML;
    // Adding a unique ID to the window name allows for multiple instances of this window
    // to be open at once without affecting each other.
    const windowName = `printWindow-${_.uniqueId()}`;
    let printWindow = window.open('', windowName, '');

    printWindow.document.open();
    printWindow.addEventListener('load', event => {
      printWindow.print();
    });

    printWindow.document.write(
      `<html><head><title>${i18n.printReportWindowTitle({
        sectionName: this.props.sectionName
      })}</title><link rel="stylesheet" type="text/css" href="/shared/css/standards-report-print.css"></head>`
    );
    printWindow.document.write('<body onafterprint="self.close()">');
    printWindow.document.write(printArea);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
  };

  render() {
    const {scriptFriendlyName} = this.props;
    const linkToOverview = this.getLinkToOverview();
    // This information is required to show all the information in the table but has
    // to be calculated after componentDidMount pulls in the information about
    // the state from the opener window.
    const teacherDashboardInformationHasLoaded =
      this.props.numLessonsInUnit !== 0 &&
      this.props.lessonsByStandard !== null;
    return (
      <div>
        {!teacherDashboardInformationHasLoaded && (
          <FontAwesome
            id="uitest-spinner"
            icon="spinner"
            className="fa-pulse fa-5x"
          />
        )}
        {teacherDashboardInformationHasLoaded && (
          <div>
            <PrintReportButton onClick={this.printReport} />
            <div id="printArea" style={styles.printView}>
              <StandardsReportHeader
                sectionName={this.props.sectionName}
                teacherName={this.props.teacherName}
              />
              <div style={styles.reportContent}>
                <h2 style={{...styles.headerColor, ...styles.currentCourse}}>
                  {i18n.currentCourse()}
                </h2>
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
                <h2 style={styles.headerColor}>
                  {i18n.standardsHowToForPrint()}
                </h2>
                <SafeMarkdown
                  openExternalLinksInNewTab={true}
                  markdown={i18n.standardsHowToDetailsForPrint({
                    courseName: scriptFriendlyName,
                    courseLink: linkToOverview,
                    cstaLink: cstaStandardsURL
                  })}
                />
                <h2 style={styles.headerColor}>
                  {i18n.CSTAStandardsPracticed()}
                </h2>
                <StandardsProgressTable
                  style={styles.table}
                  isViewingReport={true}
                />
                <StandardsLegend />
                <h2 style={styles.headerColor}>
                  {i18n.standardsGetInvolved()}
                </h2>
                <SafeMarkdown
                  markdown={i18n.standardsGetInvolvedDetailsForPrint({
                    adminLink: pegasus('/administrators'),
                    parentLink: pegasus('/help'),
                    teacherLink: '/courses'
                  })}
                />
              </div>
              <div style={styles.footer}>
                <div style={styles.mission}>
                  <SafeMarkdown markdown={i18n.missionStatement()} />
                </div>
              </div>
            </div>
            <PrintReportButton onClick={this.printReport} />
          </div>
        )}
      </div>
    );
  }
}

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
  },
  currentCourse: {
    marginBottom: 0
  }
};

export const UnconnectedStandardsReport = StandardsReport;

export default connect(
  state => ({
    scriptId: state.scriptSelection.scriptId,
    section: state.sectionData.section,
    scriptData: getCurrentScriptData(state),
    scriptFriendlyName: getSelectedScriptFriendlyName(state),
    scriptDescription: getSelectedScriptDescription(state),
    numStudentsInSection: state.sectionData.section.students.length,
    teacherComment: state.sectionStandardsProgress.teacherComment,
    teacherName: state.currentUser.userName,
    sectionName: sectionName(state, state.sectionData.section.id),
    numLessonsCompleted: getNumberLessonsCompleted(state),
    numLessonsInUnit: getNumberLessonsInScript(state),
    lessonsByStandard: lessonsByStandard(state)
  }),
  dispatch => ({
    setTeacherCommentForReport(comment) {
      dispatch(setTeacherCommentForReport(comment));
    },
    setScriptId(scriptId) {
      dispatch(setScriptId(scriptId));
    }
  })
)(StandardsReport);
