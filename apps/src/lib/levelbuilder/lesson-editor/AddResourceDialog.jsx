import PropTypes from 'prop-types';
import React, {Component} from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import DialogFooter from '@cdo/apps/templates/teacherDashboard/DialogFooter';
import Button from '@cdo/apps/templates/Button';

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    fontFamily: '"Gotham 4r", sans-serif, sans-serif'
  },
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  dropdownRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  inputAndLabel: {
    display: 'flex',
    flexDirection: 'column'
  },
  textInput: {
    width: '100%'
  },
  selectInput: {
    width: '45%'
  }
};

// TODO: Hook up adding a resource when resources are associated with lessons

export default class AddResourceDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleConfirm: PropTypes.func.isRequired,
    typeOptions: PropTypes.arrayOf(PropTypes.string),
    audienceOptions: PropTypes.arrayOf(PropTypes.string)
  };

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.props.handleConfirm}
        useUpdatedStyles
        style={styles.dialog}
      >
        <h2>Add Resource</h2>
        <div style={styles.container}>
          <label style={styles.inputAndLabel}>
            Resource Name
            <input style={styles.textInput} />
          </label>
          <div style={styles.dropdownRow}>
            <label style={styles.inputAndLabel}>
              <span>Add link to resource:</span>
              <select style={styles.selectInput} onChange={() => {}}>
                {this.props.typeOptions.map(option => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label style={styles.inputAndLabel}>
              Audience
              <select style={styles.selectInput}>
                {this.props.audienceOptions.map(option => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label style={styles.inputAndLabel}>
            URL
            <input style={styles.textInput} />
          </label>
          <label style={styles.inputAndLabel}>
            Download URL
            <input style={styles.textInput} />
          </label>
          <label style={styles.inputAndLabel}>
            Embed Slug
            <input style={styles.textInput} />
          </label>
        </div>
        <DialogFooter rightAlign>
          <Button
            text={'Close and Add'}
            onClick={this.props.handleConfirm}
            color={Button.ButtonColor.orange}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}
