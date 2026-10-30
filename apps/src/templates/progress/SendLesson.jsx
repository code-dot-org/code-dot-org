import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import SendLessonDialog from './SendLessonDialog';

export default class SendLesson extends React.Component {
  static propTypes = {
    lessonUrl: PropTypes.string.isRequired,
    lessonTitle: PropTypes.string,
    courseid: PropTypes.number,
    buttonStyle: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.openDialog = this.openDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.state = {
      isDialogOpen: false,
    };
  }

  openDialog() {
    this.setState({isDialogOpen: true});
  }

  closeDialog() {
    this.setState({isDialogOpen: false});
  }

  render() {
    return (
      <div className="uitest-sendlesson">
        <MuiButton
          onClick={this.openDialog}
          variant="outlined"
          color="secondary"
          size="small"
          startIcon={
            <FontAwesomeV6Icon iconName="share-from-square" iconStyle="solid" />
          }
          style={this.props.buttonStyle}
        >
          {i18n.sendLessonButton()}
        </MuiButton>
        {this.state.isDialogOpen && (
          <SendLessonDialog
            isOpen={true}
            handleClose={this.closeDialog}
            lessonUrl={this.props.lessonUrl}
            lessonTitle={this.props.lessonTitle}
            courseid={this.props.courseid}
          />
        )}
      </div>
    );
  }
}
