import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {
  getSelectedScriptFriendlyName,
  getSelectedScriptDescription,
  setScriptId,
} from '@cdo/apps/redux/unitSelectionRedux';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {getCurrentUnitData} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import {sectionName} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import {unitDataPropType} from '../sectionProgressConstants';
import {loadUnitProgress} from '../sectionProgressLoader';

import PrintReportButton from './PrintReportButton';
import {
  getNumberLessonsCompleted,
  getNumberLessonsInScript,
  setTeacherCommentForReport,
  lessonsByStandard,
} from './sectionStandardsProgressRedux';
import {cstaStandardsURL} from './standardsConstants';
import StandardsLegend from './StandardsLegend';
import StandardsProgressTable from './StandardsProgressTable';
import StandardsReportCurrentCourseInfo from './StandardsReportCurrentCourseInfo';
import StandardsReportHeader from './StandardsReportHeader';

class StandardsReport extends Component {
  static propTypes = {
    //redux
    scriptId: PropTypes.number,
    sectionId: PropTypes.number.isRequired,
    scriptFriendlyName: PropTypes.string.isRequired,
    scriptData: unitDataPropType,
    teacherName: PropTypes.string,
    sectionName: PropTypes.string,
    teacherComment: PropTypes.string,
    unitDescription: PropTypes.string.isRequired,
    numStudentsInSection: PropTypes.number,
    numLessonsCompleted: PropTypes.number,
    numLessonsInUnit: PropTypes.number,
    setTeacherCommentForReport: PropTypes.func.isRequired,
    setScriptId: PropTypes.func.isRequired,
    lessonsByStandard: PropTypes.object,
  };

  componentDidMount() {
    try {
      this.props.setTeacherCommentForReport(
        window.opener.teacherDashboardStoreInformation.teacherComment
      );
      const scriptIdFromTD =
        window.opener.teacherDashboardStoreInformation.scriptId;
      this.props.setScriptId(scriptIdFromTD);
      loadUnitProgress(scriptIdFromTD, this.props.sectionId);
    } catch (e) {
      throw new Error(
        '/standards_report must be opened from the `generate PDF report` button of the Standards tab on the v1 progress page on a section assigned to curriculum that has standards (e.g. `Course C (2023)`).'
      );
    }
  }

  getLinkToOverview() {
    const {scriptData, sectionId} = this.props;
    return scriptData ? `${scriptData.path}?section_id=${sectionId}` : null;
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
        sectionName: this.props.sectionName,
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
                  sectionId={this.props.sectionId}
                  scriptFriendlyName={this.props.scriptFriendlyName}
                  scriptData={this.props.scriptData}
                  unitDescription={this.props.unitDescription}
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
                    cstaLink: cstaStandardsURL,
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
                    teacherLink: pegasus('/teach'),
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
    backgroundColor: color.white,
  },
  headerColor: {
    color: color.purple,
  },
  footer: {
    backgroundColor: color.purple,
    color: color.white,
  },
  reportContent: {
    margin: '0px 50px',
  },
  mission: {
    padding: '10px 25px',
    fontSize: 11,
  },
  table: {
    width: '100%',
  },
  currentCourse: {
    marginBottom: 0,
  },
};

export const UnconnectedStandardsReport = StandardsReport;

export default connect(
  state => ({
    scriptId: state.unitSelection.scriptId,
    sectionId: state.teacherSections.selectedSectionId,
    scriptData: getCurrentUnitData(state),
    scriptFriendlyName: getSelectedScriptFriendlyName(state),
    unitDescription: getSelectedScriptDescription(state),
    numStudentsInSection: state.teacherSections.selectedStudents.length,
    teacherComment: state.sectionStandardsProgress.teacherComment,
    teacherName: state.currentUser.userName,
    sectionName: sectionName(state, state.teacherSections.selectedSectionId),
    numLessonsCompleted: getNumberLessonsCompleted(state),
    numLessonsInUnit: getNumberLessonsInScript(state),
    lessonsByStandard: lessonsByStandard(state),
  }),
  dispatch => ({
    setTeacherCommentForReport(comment) {
      dispatch(setTeacherCommentForReport(comment));
    },
    setScriptId(scriptId) {
      dispatch(setScriptId(scriptId));
    },
  })
)(StandardsReport);
