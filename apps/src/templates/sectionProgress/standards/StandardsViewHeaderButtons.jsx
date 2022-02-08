import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import LessonStatusDialog from './LessonStatusDialog';
import {CreateStandardsReportDialog} from './CreateStandardsReportDialog';
import {
  setTeacherCommentForReport,
  getUnpluggedLessonsForScript,
  fetchStudentLevelScores
} from './sectionStandardsProgressRedux';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import firehoseClient from '../../../lib/util/firehose';
import {TeacherScores} from './standardsConstants';

class StandardsViewHeaderButtons extends Component {
  static propTypes = {
    sectionId: PropTypes.number,
    // redux
    setTeacherCommentForReport: PropTypes.func.isRequired,
    scriptId: PropTypes.number,
    selectedLessons: PropTypes.array.isRequired,
    unpluggedLessons: PropTypes.array.isRequired,
    fetchStudentLevelScores: PropTypes.func
  };

  state = {
    isLessonStatusDialogOpen: false,
    isCreateReportDialogOpen: false,
    comment: '',
    commentUpdated: false
  };

  openLessonStatusDialog = () => {
    this.setState({isLessonStatusDialogOpen: true});
    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'standards',
        event: 'click_update_unplugged_lessons',
        data_json: JSON.stringify({
          section_id: this.props.sectionId,
          script_id: this.props.scriptId
        })
      },
      {includeUserId: true}
    );
  };

  closeLessonStatusDialog = () => {
    this.setState({isLessonStatusDialogOpen: false});
  };

  openCreateReportDialog = () => {
    this.setState({isCreateReportDialogOpen: true});
    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'standards',
        event: 'open_generate_report_dialog',
        data_json: JSON.stringify({
          section_id: this.props.sectionId,
          script_id: this.props.scriptId
        })
      },
      {includeUserId: true}
    );
  };

  closeCreateReportDialog = () => {
    this.setState({isCreateReportDialogOpen: false});
  };

  closeCreateReportDialogAndPrintReport = () => {
    this.setState({isCreateReportDialogOpen: false}, this.openReport);
  };

  openReport = () => {
    window.open(
      teacherDashboardUrl(this.props.sectionId, '/standards_report'),
      '_blank'
    );
    window.teacherDashboardStoreInformation = {
      teacherComment: this.state.comment,
      scriptId: this.props.scriptId
    };
    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'standards',
        event: 'generate_report',
        data_json: JSON.stringify({
          section_id: this.props.sectionId,
          script_id: this.props.scriptId,
          added_or_changed_comment: this.state.commentUpdated
        })
      },
      {includeUserId: true}
    );
    this.setState({commentUpdated: false});
  };

  onCommentChange = value => {
    this.setState({comment: value}, () => {
      this.setState({commentUpdated: true});
      this.props.setTeacherCommentForReport(this.state.comment);
    });
  };

  onSaveUnpluggedLessonStatus = () => {
    const {sectionId, selectedLessons, unpluggedLessons} = this.props;
    let selectedLessonScores = [];
    let unselectedLessonScores = [];
    const lessonIds = _.map(unpluggedLessons, 'id');
    const selectedLessonIds = _.map(selectedLessons, 'id');
    const unselectedLessonIds = _.difference(lessonIds, selectedLessonIds);

    for (var i = 0; i < selectedLessonIds.length; i++) {
      selectedLessonScores[i] = {
        lesson_id: selectedLessonIds[i],
        score: TeacherScores.COMPLETE
      };
    }

    for (var j = 0; j < unselectedLessonIds.length; j++) {
      unselectedLessonScores[j] = {
        lesson_id: unselectedLessonIds[j],
        score: TeacherScores.INCOMPLETE
      };
    }

    $.ajax({
      url: '/dashboardapi/v1/teacher_scores',
      type: 'post',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({
        section_id: sectionId,
        lesson_scores: selectedLessonScores.concat(unselectedLessonScores)
      })
    }).done(() => {
      if (this.state.isLessonStatusDialogOpen) {
        this.closeLessonStatusDialog();
      }
    });
  };

  render() {
    return (
      <div style={styles.buttonsGroup}>
        {this.props.unpluggedLessons.length > 0 && (
          <div>
            <Button
              __useDeprecatedTag
              onClick={this.openLessonStatusDialog}
              color={Button.ButtonColor.gray}
              text={i18n.updateUnpluggedProgress()}
              size={'narrow'}
              style={styles.button}
            />
            <LessonStatusDialog
              isOpen={this.state.isLessonStatusDialogOpen}
              handleConfirm={this.onSaveUnpluggedLessonStatus}
            />
          </div>
        )}
        <Button
          __useDeprecatedTag
          onClick={this.openCreateReportDialog}
          color={Button.ButtonColor.gray}
          text={i18n.generatePDFReport()}
          size="narrow"
          style={styles.button}
          className="uitest-standards-generate-report"
          icon="file-text"
        />
        <CreateStandardsReportDialog
          isOpen={this.state.isCreateReportDialogOpen}
          handleConfirm={this.closeCreateReportDialogAndPrintReport}
          handleNext={this.onSaveUnpluggedLessonStatus}
          handleClose={this.closeCreateReportDialog}
          onCommentChange={this.onCommentChange}
          sectionId={this.props.sectionId}
        />
      </div>
    );
  }
}

const styles = {
  buttonsGroup: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  button: {
    marginLeft: 20
  }
};

export const UnconnectedStandardsViewHeaderButtons = StandardsViewHeaderButtons;

export default connect(
  state => ({
    scriptId: state.unitSelection.scriptId,
    selectedLessons: state.sectionStandardsProgress.selectedLessons,
    unpluggedLessons: getUnpluggedLessonsForScript(state)
  }),
  dispatch => ({
    setTeacherCommentForReport(comment) {
      dispatch(setTeacherCommentForReport(comment));
    },
    fetchStudentLevelScores(scriptId, sectionId) {
      dispatch(fetchStudentLevelScores(scriptId, sectionId));
    }
  })
)(StandardsViewHeaderButtons);
