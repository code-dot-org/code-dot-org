import PropTypes from 'prop-types';
import React, {Component} from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';

export default class CopyUnitDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    sourceUnitName: PropTypes.string.isRequired,
    unitGroupNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    handleClose: PropTypes.func.isRequired,
  };

  defaultState = {
    newUnitName: '',
    destinationUnitGroupName: '',
    newLevelSuffix: '',
    saving: false,
    error: null,
    notice: null,
  };

  constructor(props) {
    super(props);
    this.state = {...this.defaultState};
  }

  onSubmit = () => {
    this.setState({saving: true, error: null});
    const csrfContainer = document.querySelector('meta[name="csrf-token"]');

    return fetch(`/s/${this.props.sourceUnitName}/copy`, {
      method: 'POST',
      body: JSON.stringify({
        new_unit_name: this.state.newUnitName,
        destination_unit_group_name: this.state.destinationUnitGroupName,
        new_level_suffix: this.state.newLevelSuffix,
      }),
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfContainer && csrfContainer.content,
      },
    })
      .then(response => response.json().then(json => ({ok: response.ok, json})))
      .then(({ok, json}) => {
        if (ok) {
          this.setState({notice: json.notice, saving: false});
        } else {
          this.setState({error: json.error, saving: false});
        }
      })
      .catch(() => {
        this.setState({
          error: 'Unexpected error. Please try again.',
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
      this.state.newUnitName &&
      this.state.destinationUnitGroupName &&
      this.state.newLevelSuffix;

    return (
      <BaseDialog isOpen={this.props.isOpen} handleClose={this.handleClose}>
        {this.state.notice ? (
          <div>
            <p>{this.state.notice}</p>
          </div>
        ) : (
          <div>
            <p>
              Copy unit <strong>{this.props.sourceUnitName}</strong> (including
              all lesson groups, lessons, and levels) to another unit group. The
              copy runs in the background and you'll receive an email when it's
              done.
            </p>
            {this.state.error && (
              <p style={{color: 'red'}}>{this.state.error}</p>
            )}
            <label style={styles.label}>
              New unit name (required):
              <input
                type="text"
                value={this.state.newUnitName}
                onChange={e => this.setState({newUnitName: e.target.value})}
                style={styles.input}
              />
            </label>
            <label style={styles.label}>
              Destination unit group (required):
              <select
                value={this.state.destinationUnitGroupName}
                onChange={e =>
                  this.setState({destinationUnitGroupName: e.target.value})
                }
                style={styles.input}
              >
                <option value="">-- Select a unit group --</option>
                {this.props.unitGroupNames.map(name => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label style={styles.label}>
              Level name suffix (required, e.g. "2026"):
              <input
                type="text"
                value={this.state.newLevelSuffix}
                onChange={e => this.setState({newLevelSuffix: e.target.value})}
                style={styles.input}
              />
            </label>
            {this.state.saving && <i className="fa-solid fa-spinner fa-spin" />}
          </div>
        )}
        <DialogFooter>
          <Button
            type="button"
            onClick={this.handleClose}
            text={'Close'}
            color={'gray'}
          />
          {!this.state.notice && (
            <Button
              type="button"
              onClick={this.onSubmit}
              text={'Copy unit'}
              color={'orange'}
              disabled={this.state.saving || !savable}
              id="copy-unit-button"
            />
          )}
        </DialogFooter>
      </BaseDialog>
    );
  }
}

const styles = {
  label: {
    display: 'block',
    marginBottom: 10,
  },
  input: {
    display: 'block',
    width: 300,
  },
};
