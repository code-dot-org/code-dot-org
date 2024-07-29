import PropTypes from 'prop-types';
import React, {Component} from 'react';

import BaseDialog from '@cdo/apps/templates/BaseDialog';
import Button from '@cdo/apps/templates/Button';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';

const LevelCopyText = {
  deepCopy: 'Deep Copy',
  shallowCopy: 'Shallow Copy',
};

export default class CloneLessonDialog extends Component {
  static propTypes = {
    lessonId: PropTypes.number,
    lessonName: PropTypes.string,
    handleClose: PropTypes.func.isRequired,
  };

  defaultState = {
    destinationUnit: '',
    levelCopyType: 'deepCopy',
    newLevelSuffix: '',
    saving: false,
    cloneFailed: false,
    cloneSucceeded: false,
    responseData: null,
  };

  constructor(props) {
    super(props);
    this.state = {...this.defaultState};
  }

  onCloneClick = () => {
    this.setState({saving: true});
    const csrfContainer = document.querySelector('meta[name="csrf-token"]');
    let success = false;
    const newLevelSuffix =
      this.state.levelCopyType === 'deepCopy' && this.state.newLevelSuffix;

    return fetch(`/lessons/${this.props.lessonId}/clone`, {
      method: 'POST',
      body: JSON.stringify({
        destinationUnitName: this.state.destinationUnit,
        newLevelSuffix,
      }),
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfContainer && csrfContainer.content,
      },
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
          saving: false,
        });
      });
  };

  handleClose = () => {
    this.setState({...this.defaultState});
    this.props.handleClose();
  };

  render() {
    const savable =
      this.state.destinationUnit &&
      (this.state.levelCopyType === 'shallowCopy' || this.state.newLevelSuffix);
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
              the unit edit page
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
              to the end of the last lesson group in the unit. Which unit do you
              want to clone this lesson to?
              <input
                type="text"
                value={this.state.destinationUnit}
                onChange={e => this.setState({destinationUnit: e.target.value})}
              />
            </label>
            <label>
              Level copy type:{' '}
              <select
                className="levelCopySelector"
                value={this.state.levelCopyType}
                style={styles.dropdown}
                onChange={e => this.setState({levelCopyType: e.target.value})}
              >
                {Object.keys(LevelCopyText).map(type => (
                  <option key={type} value={type}>
                    {LevelCopyText[type]}
                  </option>
                ))}
              </select>
            </label>
            <table style={styles.table}>
              <tbody>
                <tr>
                  <td style={styles.tableCell}>Deep Copy (recommended)</td>
                  <td style={styles.tableCell}>
                    Create a new copy of each level within the lesson.
                  </td>
                </tr>
                <tr>
                  <td style={styles.tableCell}>Shallow Copy</td>
                  <td style={styles.tableCell}>
                    Share existing levels with the original lesson. This can
                    lead to problems later, so be sure you want this before
                    proceeding with this option.
                  </td>
                </tr>
              </tbody>
            </table>
            {this.state.levelCopyType === 'deepCopy' && (
              <label>
                Suffix to add when copying levels:{' '}
                <input
                  type="text"
                  value={this.state.newLevelSuffix}
                  onChange={e =>
                    this.setState({newLevelSuffix: e.target.value})
                  }
                />
              </label>
            )}
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
              disabled={this.state.saving || !savable}
              id="clone-lesson-button"
            />
          )}
        </DialogFooter>
      </BaseDialog>
    );
  }
}

const styles = {
  dropdown: {
    width: 200,
  },
  table: {
    border: 'none',
    marginBottom: 10,
  },
  tableCell: {
    border: '1px solid black',
    padding: 3,
  },
};
