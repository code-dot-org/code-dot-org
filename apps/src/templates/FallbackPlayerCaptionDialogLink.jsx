import React, {Component, PropTypes} from 'react';
import Button from './Button';
import i18n from "@cdo/locale";
import BaseDialog from './BaseDialog';
import DialogFooter from "./teacherDashboard/DialogFooter";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const styles = {
  link: {
    cursor: 'pointer'
  },
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    textAlign: 'left'
  },
  dialogLink: {
    marginTop: 20
  }
};

export default class FallbackPlayerCaptionDialogLink extends React.Component {
  static propTypes = {
    inDialog: PropTypes.bool
  };

  state = {open: false};
  open = () => this.setState({open: true});
  close = () => this.setState({open: false});

  render() {
    return (
      <div>
        <FallbackPlayerCaptionDialog
          isDialogOpen={this.state.open}
          handleClose={this.close}
        />
        {!this.props.inDialog && (
          <span>
            |
            &nbsp;
          </span>
        )}
        <a
          className="ui-test-fallback-player-caption-dialog-link"
          onClick={this.open}
          style={styles.link}
        >
          {i18n.fallbackVideoClosedCaptioningLink()}
        </a>
      </div>
    );
  }
}

class FallbackPlayerCaptionDialog extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func
  };

  render() {
    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.props.isDialogOpen}
        style={styles.dialog}
        handleClose={this.props.handleClose}
      >
        <h2 className="ui-test-fallback-player-caption-dialog">
          {i18n.fallbackVideoClosedCaptioningDialogHeading()}
        </h2>
        <div>
          {i18n.fallbackVideoClosedCaptioningDialogBody()}
        </div>
        <div style={styles.dialogLink}>
          <a
            href={pegasus('/educate/it')}
            target="_blank"
          >
            {i18n.fallbackVideoClosedCaptioningDialogBodyLink()}
          </a>
        </div>
        <DialogFooter>
          <Button
            className="ui-test-fallback-player-caption-dialog-close"
            text={i18n.fallbackVideoClosedCaptioningDialogClose()}
            onClick={this.props.handleClose}
            color={Button.ButtonColor.orange}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}
