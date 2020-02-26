import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import LessonStatusDialog from './LessonStatusDialog';
import {CreateStandardsReportDialog} from './CreateStandardsReportDialog';
import {setTeacherCommentForReport} from './sectionStandardsProgressRedux';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';

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
    scriptId: PropTypes.number
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

  render() {
    return (
      <div style={styles.buttonsGroup}>
        <Button
          onClick={this.openLessonStatusDialog}
          color={Button.ButtonColor.gray}
          text={i18n.updateUnpluggedProgress()}
          size={'narrow'}
          style={styles.button}
        />
        <LessonStatusDialog
          isOpen={this.state.isLessonStatusDialogOpen}
          handleConfirm={this.closeLessonStatusDialog}
        />
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
    scriptId: state.scriptSelection.scriptId
  }),
  dispatch => ({
    setTeacherCommentForReport(comment) {
      dispatch(setTeacherCommentForReport(comment));
    }
  })
)(StandardsViewHeaderButtons);
