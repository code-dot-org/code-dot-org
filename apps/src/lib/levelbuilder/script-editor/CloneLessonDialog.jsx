import React, {Component} from 'react';
import PropTypes from 'prop-types';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';

export default class CloneLessonDialog extends Component {
  static propTypes = {
    lessonId: PropTypes.number,
    lessonName: PropTypes.string,
    handleClose: PropTypes.func.isRequired
  };

  defaultState = {
    destinationUnit: '',
    saving: false,
    cloneFailed: false,
    cloneSucceeded: false,
    responseData: null
  };

  constructor(props) {
    super(props);
    this.state = {...this.defaultState};
  }

  onCloneClick = () => {
    this.setState({saving: true});
    const csrfContainer = document.querySelector('meta[name="csrf-token"]');
    let success = false;

    return fetch(`/lessons/${this.props.lessonId}/clone`, {
      method: 'POST',
      body: JSON.stringify({
        destinationUnitName: this.state.destinationUnit
      }),
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfContainer && csrfContainer.content
      }
    })
      .then(response => {
        success = response.ok;
        return response;
      })
      .then(response => response.json())
      .then(json => {
        this.setState({
          responseData: json,
          cloneSucceeded: success,
          cloneFailed: !success,
          saving: false
        });
      });
  };

  handleClose = () => {
    this.setState({...this.defaultState});
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
        {this.state.cloneFailed && (
          <span style={{color: 'red'}}>{this.state.responseData.error}</span>
        )}
        {this.state.cloneSucceeded ? (
          <span>
            Clone succeeded! Visit{' '}
            <a
              href={this.state.responseData.editScriptUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              the script edit page
            </a>{' '}
            to move the cloned lesson or{' '}
            <a
              href={this.state.responseData.editLessonUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              the lesson edit page
            </a>{' '}
            to edit it.
          </span>
        ) : (
          <div>
            <label>
              Cloning will add lesson <strong>{this.props.lessonName}</strong>{' '}
              to the end of the last lesson group in the script. Which script do
              you want to clone this lesson to?
              <input
                type="text"
                value={this.state.destinationUnit}
                onChange={e => this.setState({destinationUnit: e.target.value})}
              />
            </label>
            {this.state.saving && <i className="fa fa-spinner fa-spin" />}
          </div>
        )}
        <DialogFooter>
          <Button onClick={this.handleClose} text={'Close'} color={'gray'} />
          {!this.state.cloneSucceeded && (
            <Button
              onClick={this.onCloneClick}
              text={'Clone'}
              color={'orange'}
              disabled={this.state.saving}
            />
          )}
        </DialogFooter>
      </BaseDialog>
    );
  }
}
