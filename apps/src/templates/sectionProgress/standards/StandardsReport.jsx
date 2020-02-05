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
  getNumberLessonsInScript
} from './sectionStandardsProgressRedux';
import StandardsLegendForPrint from './StandardsLegendForPrint';
import StandardsReportCurrentCourseInfo from './StandardsReportCurrentCourseInfo';
import StandardsReportHeader from './StandardsReportHeader';
import color from '@cdo/apps/util/color';
import Button from '../../Button';
import _ from 'lodash';
import {getStandardsCoveredForScript} from '@cdo/apps/templates/sectionProgress/standards/sectionStandardsProgressRedux';
import {loadScript} from '../sectionProgressRedux';

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
  button: {
    margin: '20px 0px'
  }
};

class StandardsReport extends Component {
  static propTypes = {
    //redux
    scriptId: PropTypes.number,
    loadScript: PropTypes.func.isRequired,
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
    getStandardsCoveredForScript: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.props.loadScript(this.props.scriptId);
    this.props.getStandardsCoveredForScript(this.props.scriptId);
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
        sectionName: this.props.section.name
      })}</title></head>`
    );
    printWindow.document.write('<body>'); //onafterprint="self.close()"
    printWindow.document.write(printArea);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
  };

  render() {
    const {scriptFriendlyName} = this.props;
    const linkToOverview = this.getLinkToOverview();
    return (
      <div>
        <Button
          onClick={this.printReport}
          color={Button.ButtonColor.orange}
          text={i18n.printReport()}
          size={'narrow'}
          style={styles.button}
        />
        <div id="printArea" style={styles.printView}>
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
            <div style={styles.mission}>
              <SafeMarkdown markdown={i18n.missionStatement()} />
            </div>
          </div>
        </div>
        <Button
          onClick={this.printReport}
          color={Button.ButtonColor.orange}
          text={i18n.printReport()}
          size={'narrow'}
          style={styles.button}
        />
      </div>
    );
  }
}

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
    numLessonsInUnit: getNumberLessonsInScript(state)
  }),
  dispatch => ({
    loadScript(scriptId) {
      dispatch(loadScript(scriptId));
    },
    getStandardsCoveredForScript(scriptId) {
      dispatch(getStandardsCoveredForScript(scriptId));
    }
  })
)(StandardsReport);
