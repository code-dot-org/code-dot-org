import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import SendLessonDialog from './SendLessonDialog';

export default class SendLesson extends React.Component {
  static propTypes = {
    lessonUrl: PropTypes.string.isRequired,
    lessonTitle: PropTypes.string,
    courseid: PropTypes.number,
    analyticsData: PropTypes.string,
    buttonStyle: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.openDialog = this.openDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.state = {
      isDialogOpen: false
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
      <div>
        <Button
          __useDeprecatedTag
          onClick={this.openDialog}
          text={i18n.sendLessonButton()}
          icon="share-square-o"
          color={Button.ButtonColor.gray}
          style={this.props.buttonStyle}
        />
        {this.state.isDialogOpen && (
          <SendLessonDialog
            isOpen={true}
            handleClose={this.closeDialog}
            lessonUrl={this.props.lessonUrl}
            lessonTitle={this.props.lessonTitle}
            courseid={this.props.courseid}
            analyticsData={this.props.analyticsData}
          />
        )}
      </div>
    );
  }
}
