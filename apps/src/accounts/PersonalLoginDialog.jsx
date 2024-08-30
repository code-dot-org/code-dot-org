import PropTypes from 'prop-types';
import React from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import {ADD_A_PERSONAL_LOGIN_HELP_URL} from '@cdo/apps/lib/util/urlHelpers';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import {
  Header,
  ConfirmCancelFooter,
} from '../sharedComponents/SystemDialog/SystemDialog';

const GUTTER = 20;

export default class PersonalLoginDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    dependentStudentsCount: PropTypes.number.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
  };

  render() {
    const {isOpen, dependentStudentsCount, onCancel, onConfirm} = this.props;

    return (
      <BaseDialog
        useUpdatedStyles
        fixedWidth={550}
        isOpen={isOpen}
        handleClose={onCancel}
      >
        <div style={styles.container}>
          <Header text={i18n.deleteAccountDialog_header()} />
          <p>
            <strong style={styles.dangerText}>
              {i18n.personalLoginDialog_body1({
                numStudents: dependentStudentsCount,
              })}
              {i18n.personalLoginDialog_body2({
                numStudents: dependentStudentsCount,
              })}
            </strong>
          </p>
          <p>
            {i18n.personalLoginDialog_body3()}
            <strong>{i18n.personalLoginDialog_body4()}</strong>
            {i18n.personalLoginDialog_body5()}
          </p>
          <Button
            __useDeprecatedTag
            text={i18n.removeStudentSendHomeInstructions()}
            target="_blank"
            href={ADD_A_PERSONAL_LOGIN_HELP_URL}
            color={Button.ButtonColor.blue}
            size={Button.ButtonSize.large}
            style={styles.button}
            tabIndex="1"
          />
          <p>{i18n.personalLoginDialog_body6()}</p>
          <ConfirmCancelFooter
            confirmText={i18n.personalLoginDialog_button()}
            onConfirm={onConfirm}
            onCancel={onCancel}
            tabIndex="1"
          />
        </div>
      </BaseDialog>
    );
  }
}

const styles = {
  container: {
    margin: GUTTER,
    color: color.charcoal,
  },
  dangerText: {
    color: color.red,
  },
  studentBox: {
    padding: GUTTER / 2,
    marginBottom: GUTTER / 2,
    backgroundColor: color.background_gray,
    border: `1px solid ${color.lighter_gray}`,
    borderRadius: 4,
    height: 50,
    overflowY: 'scroll',
  },
  button: {
    display: 'block',
    textAlign: 'center',
    marginBottom: '1em',
  },
};
