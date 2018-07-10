import React from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import BootstrapButton from './BootstrapButton';
import DeleteAccountDialog from './DeleteAccountDialog';

const styles = {
  container: {
    paddingTop: 20,
  },
  hr: {
    borderColor: color.red,
  },
  header: {
    fontSize: 22,
    color: color.red,
  },
  hint: {
    marginTop: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
};

export default class DeleteAccount extends React.Component {
  state = {
    isDialogOpen: false
  };

  toggleDialog = () => {
    this.setState(state => {
      return {
        isDialogOpen: !state.isDialogOpen
      };
    });
  };

  render() {
    return (
      <div style={styles.container}>
        <hr style={styles.hr} />
        <h2 style={styles.header}>
          {i18n.deleteAccount()}
        </h2>
        <div style={styles.hint}>
          {i18n.deleteAccount_hint()}
        </div>
        <div style={styles.buttonContainer}>
          {/* This button intentionally uses BootstrapButton to match other account page buttons */}
          <BootstrapButton
            type="danger"
            text={i18n.deleteAccount()}
            onClick={this.toggleDialog}
          />
        </div>
        <DeleteAccountDialog
          isOpen={this.state.isDialogOpen}
          onCancel={this.toggleDialog}
        />
      </div>
    );
  }
}
