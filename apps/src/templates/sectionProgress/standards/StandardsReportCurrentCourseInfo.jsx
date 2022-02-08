import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {scriptDataPropType} from '@cdo/apps/templates/sectionProgress/sectionProgressConstants';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import color from '@cdo/apps/util/color';
import {cstaStandardsURL} from './standardsConstants';

export default class StandardsReportCurrentCourseInfo extends Component {
  static propTypes = {
    section: sectionDataPropType.isRequired,
    scriptFriendlyName: PropTypes.string.isRequired,
    scriptData: scriptDataPropType,
    unitDescription: PropTypes.string.isRequired,
    numStudentsInSection: PropTypes.number,
    numLessonsCompleted: PropTypes.number,
    numLessonsInUnit: PropTypes.number
  };

  getLinkToOverview() {
    const {scriptData, section} = this.props;
    return scriptData ? `${scriptData.path}?section_id=${section.id}` : null;
  }

  render() {
    const linkToOverview = this.getLinkToOverview();
    return (
      <div style={styles.currentCourse}>
        <div style={styles.courseOverview}>
          <h3>
            <a href={linkToOverview} style={styles.scriptLink}>
              {this.props.scriptFriendlyName}
            </a>
          </h3>
          <p>{this.props.unitDescription} </p>
          <SafeMarkdown
            markdown={i18n.mapsToCSTAStandards({
              cstaLink: cstaStandardsURL
            })}
          />
        </div>
        <div style={styles.classProgress}>
          <h3>{i18n.classProgress()}</h3>
          <div style={styles.statsRow}>
            <span>{i18n.lessonsCompletedWithColon()}</span>
            <span>{this.props.numLessonsCompleted}</span>
          </div>
          <div style={styles.statsRow}>
            <span>{i18n.lessonsAvailableWithColon() + '*'}</span>
            <span>{this.props.numLessonsInUnit}</span>
          </div>
          <div style={styles.statsRow}>
            <span>{i18n.studentsInSection()}</span>
            <span>{this.props.numStudentsInSection}</span>
          </div>
          <span style={styles.lessonNote}>
            {i18n.standardsReportLessonLengthInfo()}
          </span>
        </div>
      </div>
    );
  }
}

const styles = {
  currentCourse: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%'
  },
  classProgress: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 30
  },
  courseOverview: {
    width: '75%'
  },
  scriptLink: {
    color: color.teal
  },
  statsRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  lessonNote: {
    marginTop: 10
  }
};
