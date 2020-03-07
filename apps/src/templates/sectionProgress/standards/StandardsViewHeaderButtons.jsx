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
  getUnpluggedLessonsForScript
} from './sectionStandardsProgressRedux';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import {TeacherScores} from './standardsConstants';

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

class StandardsViewHeaderButtons extends Component {
  static propTypes = {
    sectionId: PropTypes.number,
    // redux
    setTeacherCommentForReport: PropTypes.func.isRequired,
    scriptId: PropTypes.number,
    selectedLessons: PropTypes.array.isRequired,
    unpluggedLessons: PropTypes.array.isRequired
  };

  state = {
    isLessonStatusDialogOpen: false,
    isCreateReportDialogOpen: false,
    comment: ''
  };

  openLessonStatusDialog = () => {
    this.setState({isLessonStatusDialogOpen: true});
  };

  closeLessonStatusDialog = () => {
    this.setState({isLessonStatusDialogOpen: false});
  };

  openCreateReportDialog = () => {
    this.setState({isCreateReportDialogOpen: true});
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
  };

  onCommentChange = value => {
    this.setState({comment: value}, () => {
      this.props.setTeacherCommentForReport(this.state.comment);
    });
  };

  onSaveUnpluggedLessonStatus = () => {
    const {sectionId, selectedLessons, unpluggedLessons} = this.props;
    let selectedStageScores = [];
    let unselectedStageScores = [];
    const stageIds = _.map(unpluggedLessons, 'id');
    const selectedStageIds = _.map(selectedLessons, 'id');
    const unselectedStageIds = _.difference(stageIds, selectedStageIds);

    for (var i = 0; i < selectedStageIds.length; i++) {
      selectedStageScores[i] = {
        stage_id: selectedStageIds[i],
        score: TeacherScores.COMPLETE
      };
    }

    for (var j = 0; j < unselectedStageIds.length; j++) {
      unselectedStageScores[j] = {
        stage_id: unselectedStageIds[j],
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
        stage_scores: selectedStageScores.concat(unselectedStageScores)
      })
    }).done(() => {
      this.closeLessonStatusDialog();
    });
  };

  render() {
    return (
      <div style={styles.buttonsGroup}>
        {this.props.unpluggedLessons.length > 0 && (
          <div>
            <Button
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
          onClick={this.openCreateReportDialog}
          color={Button.ButtonColor.gray}
          text={i18n.generatePDFReport()}
          size={'narrow'}
          style={styles.button}
          className="uitest-standards-generate-report"
        />
        <CreateStandardsReportDialog
          isOpen={this.state.isCreateReportDialogOpen}
          handleConfirm={this.closeCreateReportDialogAndPrintReport}
          handleClose={this.closeCreateReportDialog}
          onCommentChange={this.onCommentChange}
          sectionId={this.props.sectionId}
        />
      </div>
    );
  }
}

export const UnconnectedStandardsViewHeaderButtons = StandardsViewHeaderButtons;

export default connect(
  state => ({
    scriptId: state.scriptSelection.scriptId,
    selectedLessons: state.sectionStandardsProgress.selectedLessons,
    unpluggedLessons: getUnpluggedLessonsForScript(state)
  }),
  dispatch => ({
    setTeacherCommentForReport(comment) {
      dispatch(setTeacherCommentForReport(comment));
    }
  })
)(StandardsViewHeaderButtons);
