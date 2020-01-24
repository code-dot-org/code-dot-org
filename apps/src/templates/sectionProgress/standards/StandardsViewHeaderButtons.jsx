import React, {Component} from 'react';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import {LessonStatusDialog} from './LessonStatusDialog';
import {CreateStandardsReportDialog} from './CreateStandardsReportDialog';
import {setTeacherCommentForReport} from './sectionStandardsProgressRedux';

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

export class StandardsViewHeaderButtons extends Component {
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
    setTeacherCommentForReport(this.state.comment);
    this.printStandards();
  };

  onCommentChange = value => {
    this.setState({comment: value});
  };

  printStandards = () => {
    console.log('Print standards with teacher comment: ' + this.state.comment);
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
        />
        <CreateStandardsReportDialog
          isOpen={this.state.isCreateReportDialogOpen}
          handleConfirm={this.closeCreateReportDialog}
          onCommentChange={this.onCommentChange}
        />
      </div>
    );
  }
}
