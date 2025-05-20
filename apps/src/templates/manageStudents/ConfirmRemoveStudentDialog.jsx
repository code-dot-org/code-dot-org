import LinkButton, {buttonColors} from '@code-dot-org/component-library/button';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import {
  ADD_A_PERSONAL_LOGIN_HELP_URL,
  RELEASE_OR_DELETE_RECORDS_EXPLANATION,
} from '@cdo/apps/lib/util/urlHelpers';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import {
  Header,
  ConfirmCancelFooter,
} from '../../sharedComponents/SystemDialog/SystemDialog';
import color from '../../util/color';
import BaseDialog from '../BaseDialog';

// A stub set of otherwise-required props for use in stories and unit tests.
export const MINIMUM_TEST_PROPS = {
  isOpen: true,
  studentName: 'Clark Kent',
  onConfirm: () => {},
  onCancel: () => {},
};

// This set of props will be 'inherited' from BaseDialog and automatically
// passed through to it.
const propsFromBaseDialog = ['isOpen', 'hideBackdrop'];

export default class ConfirmRemoveStudentDialog extends React.Component {
  static propTypes = {
    ..._.pick(BaseDialog.propTypes, propsFromBaseDialog),
    disabled: PropTypes.bool,
    studentName: PropTypes.string.isRequired,
    hasEverSignedIn: PropTypes.bool,
    dependsOnThisSectionForLogin: PropTypes.bool,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  headerText() {
    const {studentName, hasEverSignedIn} = this.props;
    return hasEverSignedIn
      ? i18n.removeStudentAndRecordsHeader({studentName})
      : i18n.removeUnusedStudentHeader({studentName});
  }

  render() {
    const {
      disabled,
      hasEverSignedIn,
      dependsOnThisSectionForLogin,
      onConfirm,
      onCancel,
    } = this.props;
    return (
      <BaseDialog
        {..._.pick(this.props, propsFromBaseDialog)}
        useUpdatedStyles
        handleClose={onCancel}
      >
        <div style={styles.container}>
          <Header text={this.headerText()} hideBorder={!hasEverSignedIn} />
          {hasEverSignedIn && (
            <div>
              <SafeMarkdown markdown={i18n.removeStudentBody1()} />
              <p>
                <a
                  href={RELEASE_OR_DELETE_RECORDS_EXPLANATION}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {i18n.learnMore()}
                </a>
              </p>
              {dependsOnThisSectionForLogin && (
                <div>
                  <p>{i18n.removeStudentBody2()}</p>
                  <LinkButton
                    useAsLink={true}
                    text={i18n.removeStudentSendHomeInstructions()}
                    target="_blank"
                    rel="noopener noreferrer"
                    href={ADD_A_PERSONAL_LOGIN_HELP_URL}
                    color={buttonColors.purple}
                    size="m"
                    style={styles.sendHomeInstructionsButton}
                  />
                </div>
              )}
            </div>
          )}
          <ConfirmCancelFooter
            confirmText={i18n.removeStudent()}
            confirmColor={buttonColors.destructive}
            onConfirm={onConfirm}
            onCancel={onCancel}
            disableConfirm={!!disabled}
            disableCancel={!!disabled}
          />
        </div>
      </BaseDialog>
    );
  }
}

const styles = {
  container: {
    margin: 20,
    color: color.charcoal,
  },
  sendHomeInstructionsButton: {
    display: 'block',
    textAlign: 'center',
    marginBottom: '1em',
  },
};
