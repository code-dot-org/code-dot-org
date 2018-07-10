import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import {Header, ConfirmCancelFooter} from '../SystemDialog/SystemDialog';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from '@cdo/apps/templates/Button';

const GUTTER = 20;
const styles = {
  container: {
    margin: GUTTER,
  },
  bodyContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    color: color.red,
    fontSize: 100,
  },
  text: {
    fontSize: 16,
    paddingLeft: GUTTER,
  },
};

export default class DeleteAccountDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  render() {
    const {isOpen, onCancel} = this.props;

    return (
      <BaseDialog
        useUpdatedStyles
        fixedWidth={600}
        isOpen={isOpen}
        handleClose={onCancel}
      >
        <div style={styles.container}>
          <Header text={i18n.deleteAccount_dialog_header()}/>
          <div style={styles.bodyContainer}>
            <FontAwesome
              icon="exclamation-triangle"
              style={styles.icon}
            />
            <div style={styles.text}>
              {i18n.deleteAccount_dialog_body()}
            </div>
          </div>
          <ConfirmCancelFooter
            confirmText={i18n.deleteAccount_dialog_button()}
            confirmColor={Button.ButtonColor.red}
            onConfirm={() => {}}
            onCancel={onCancel}
            disableConfirm={false}
            tabIndex="1"
          />
        </div>
      </BaseDialog>
    );
  }
}
