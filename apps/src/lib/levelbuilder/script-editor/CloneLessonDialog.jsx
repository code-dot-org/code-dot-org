import React, {Component} from 'react';
import PropTypes from 'prop-types';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';

export default class CloneLessonDialog extends Component {
  static propTypes = {
    lessonId: PropTypes.number,
    handleClose: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      destinationScript: '',
      error: '',
      saving: false,
      cloneSucceeded: false
    };
  }

  onCloneClick = e => {
    e.preventDefault();
    this.setState({saving: true});
    const csrfContainer = document.querySelector('meta[name="csrf-token"]');
    fetch(`/lessons/${this.props.lessonId}/clone`, {
      method: 'POST',
      body: JSON.stringify({
        destinationScriptName: this.state.destinationScript
      }),
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfContainer && csrfContainer.content
      }
    }).then(data => {
      if (data.ok) {
        this.setState({saving: false, error: '', cloneSucceeded: true});
      } else {
        this.setState({
          error: 'Clone failed',
          saving: false,
          cloneSucceeded: false
        });
      }
    });
  };

  handleClose = () => {
    this.setState({destinationScript: '', cloneSucceeded: false});
    this.props.handleClose();
  };

  render() {
    return (
      <BaseDialog
        cancelText="Cancel"
        confirmText="Delete"
        confirmType="danger"
        handleClose={this.handleClose}
        isOpen={!!this.props.lessonId}
      >
        {this.state.error && (
          <span style={{color: 'red'}}>{this.state.error}</span>
        )}
        {this.state.cloneSucceeded ? (
          <span>Clone succeeded!</span>
        ) : (
          <div>
            <label>
              Which script do you want to clone this lesson to?
              <input
                type="text"
                value={this.state.destinationScript}
                onChange={e =>
                  this.setState({destinationScript: e.target.value})
                }
              />
            </label>
            Cloning will add this lesson to the end of the last lesson group in
            the script.
          </div>
        )}
        <DialogFooter>
          <Button onClick={this.handleClose} text={'Close'} color={'gray'} />
          <Button
            onClick={this.onCloneClick}
            text={'Clone'}
            color={'orange'}
            disabled={this.state.saving}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}
