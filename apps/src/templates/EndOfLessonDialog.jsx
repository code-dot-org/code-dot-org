import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from './Button';
import i18n from '@cdo/locale';
import BaseDialog from './BaseDialog';
import DialogFooter from './teacherDashboard/DialogFooter';

export default class EndOfLessonDialog extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    lessonNumber: PropTypes.string.isRequired
  };

  state = {
    isDialogOpen: this.props.isDialogOpen
  };

  closeDialog = () => {
    this.setState({isDialogOpen: false});
  };

  render() {
    const {lessonNumber} = this.props;

    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.state.isDialogOpen}
        style={styles.dialog}
      >
        <h2>{i18n.endOfLessonDialogHeading({lessonNumber})}</h2>
        <div>{i18n.endOfLessonDialogDetails()}</div>
        <DialogFooter>
          <Button
            __useDeprecatedTag
            text={i18n.ok()}
            color={Button.ButtonColor.gray}
            onClick={this.closeDialog}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  },
  instructions: {
    marginTop: 20
  }
};
