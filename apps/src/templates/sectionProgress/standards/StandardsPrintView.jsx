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
import {getSelectedScriptFriendlyName} from '@cdo/apps/redux/scriptSelectionRedux';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import StandardsProgressTable from './StandardsProgressTable';
import color from '@cdo/apps/util/color';
import {sectionName} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import ProgressBoxForLessonNumber from './ProgressBoxForLessonNumber';

const styles = {
  classProgress: {
    display: 'flex',
    flexDirection: 'column'
  },
  currentClass: {
    display: 'flex',
    flexDirection: 'row'
  },
  courseOverview: {
    width: '40%'
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: color.teal,
    color: color.white
  },
  headerRightColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  headerName: {
    fontSize: 40
  },
  scriptLink: {
    color: color.teal
  },
  statsRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  key: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  keyItems: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: '0 10px'
  },
  boxStyle: {
    marginLeft: 10
  }
};

class StandardsPrintView extends Component {
  static propTypes = {
    //redux
    section: sectionDataPropType.isRequired,
    scriptFriendlyName: PropTypes.string.isRequired,
    scriptData: scriptDataPropType,
    scriptDescription: PropTypes.string.isRequired,
    numStudentsInSection: PropTypes.number,
    teacherName: PropTypes.string,
    sectionName: PropTypes.string,
    teacherComment: PropTypes.string
  };

  getLinkToOverview() {
    const {scriptData, section} = this.props;
    return scriptData ? `${scriptData.path}?section_id=${section.id}` : null;
  }

  render() {
    const {scriptFriendlyName} = this.props;
    const linkToOverview = this.getLinkToOverview();
    return (
      <div>
        <div style={styles.header}>
          <div style={styles.headerName}>{i18n.standardsReportHeader()}</div>
          <div style={styles.headerRightColumn}>
            <span>Teacher: Mr. Barrett</span>
            <span>
              {i18n.sectionAndName({sectionName: this.props.sectionName})}
            </span>
            <span>{i18n.dateAndDate({date: new Date().toLocaleString()})}</span>
          </div>
        </div>
        <div>
          <h2>{i18n.currentCourse()}</h2>
          <div style={styles.currentClass}>
            <div style={styles.courseOverview}>
              <a href={linkToOverview} style={styles.scriptLink}>
                {this.props.scriptFriendlyName}
              </a>
              <p>{this.props.scriptDescription} </p>
              <ul>
                <li>
                  <SafeMarkdown
                    markdown={i18n.mapsToCSTAStandards({
                      cstaLink: 'https://www.csteachers.org/page/standards'
                    })}
                  />
                </li>
              </ul>
            </div>
            <div style={styles.classProgress}>
              <h3>{i18n.classProgress()}</h3>
              <div style={styles.statsRow}>
                <span>{i18n.lessonsCompletedWithColon()}</span>
                <span>{'5'}</span>
              </div>
              <div style={styles.statsRow}>
                <span>{i18n.lessonsAvailableWithColon()}</span>
                <span>{'5'}</span>
              </div>
              <div style={styles.statsRow}>
                <span>{i18n.studentsInSection()}</span>
                <span>{this.props.numStudentsInSection}</span>
              </div>
              <span>{i18n.standardsReportLessonLengthInfo()}</span>
            </div>
          </div>
        </div>
        {this.props.teacherComment && (
          <div>
            <h2>{i18n.teacherComments()}</h2>
            <p>{this.props.teacherComment}</p>
          </div>
        )}
        <div>
          <h2>{i18n.CSTAStandardsPracticed()}</h2>
          <StandardsProgressTable />
        </div>
        <div style={styles.key}>
          <span>{i18n.key()}</span>
          <span style={styles.keyItems}>
            {i18n.completedLessons()}
            <ProgressBoxForLessonNumber completed={true} lessonNumber={1} />
          </span>
          <span style={styles.keyItems}>
            {i18n.uncompeltedLessons()}
            <ProgressBoxForLessonNumber completed={false} lessonNumber={1} />
          </span>
        </div>
        <div>
          <h3>{i18n.standardsHowToForPrint()}</h3>
          <SafeMarkdown
            openExternalLinksInNewTab={true}
            markdown={i18n.standardsHowToDetailsForPrint({
              courseName: scriptFriendlyName,
              courseLink: linkToOverview,
              cstaLink: 'https://www.csteachers.org/page/standards'
            })}
          />
          <h3>{i18n.standardsGetInvolved()}</h3>
          <SafeMarkdown
            markdown={i18n.standardsGetInvolvedDetailsForPrint({
              adminLink: pegasus('/administrator'),
              parentLink: pegasus('/help'),
              teacherLink: '/courses'
            })}
          />
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
  scriptDescription: state.progress.scriptDescription,
  numStudentsInSection: state.sectionData.section.students.length,
  teacherName: state.currentUser.userName,
  sectionName: sectionName(state, state.sectionData.section.id),
  teacherComment: state.sectionStandardsProgress.teacherComment
}))(StandardsPrintView);
