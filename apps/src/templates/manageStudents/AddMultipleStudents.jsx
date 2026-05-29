import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Modal from '@code-dot-org/component-library/modal';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import {addMultipleAddRows} from './manageStudentsRedux';

import moduleStyles from './addMultipleStudents.module.scss';

class AddMultipleStudents extends Component {
  static propTypes = {
    sectionId: PropTypes.number,
    // Provided by redux
    addMultipleStudents: PropTypes.func.isRequired,
  };

  state = {
    isDialogOpen: false,
  };

  textareaRef = React.createRef();

  openDialog = () => {
    this.setState({isDialogOpen: true});
  };

  closeDialog = () => {
    this.setState({isDialogOpen: false});
  };

  add = () => {
    const value = this.textareaRef.current.value;
    const studentDataArray = value.split('\n').map(line => {
      const parts = line.split(',');
      const name = parts[0].trim();
      const familyName = parts.length > 1 ? parts[1].trim() : null;
      return {name, familyName};
    });
    this.props.addMultipleStudents(studentDataArray);
    this.closeDialog();
  };

  render() {
    return (
      <>
        <MuiButton
          variant="outlined"
          color="tertiary"
          size="small"
          onClick={this.openDialog}
          type="button"
          startIcon={<FontAwesomeV6Icon iconName="plus" />}
        >
          {i18n.addStudentsMultiple()}
        </MuiButton>
        {this.state.isDialogOpen && (
          <Modal
            title={i18n.addStudentsMultiple()}
            description={i18n.addStudentsMultipleWithFamilyNameInstructions()}
            onClose={this.closeDialog}
            customContent={
              <textarea
                rows="15"
                cols="70"
                ref={this.textareaRef}
                className={moduleStyles.textarea}
                aria-label={i18n.addStudentsMultiple()}
              />
            }
            primaryButtonProps={{
              children: i18n.done(),
              onClick: this.add,
            }}
            secondaryButtonProps={{
              children: i18n.dialogCancel(),
              onClick: this.closeDialog,
            }}
          />
        )}
      </>
    );
  }
}

export default connect(
  state => ({}),
  dispatch => ({
    addMultipleStudents(names) {
      dispatch(addMultipleAddRows(names));
    },
  })
)(AddMultipleStudents);
