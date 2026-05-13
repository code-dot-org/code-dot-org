import Dialog from '@code-dot-org/component-library/dialog';
import Link from '@code-dot-org/component-library/link';
import PropTypes from 'prop-types';
import React from 'react';

import {
  ADD_A_PERSONAL_LOGIN_HELP_URL,
  RELEASE_OR_DELETE_RECORDS_EXPLANATION,
} from '@cdo/apps/lib/util/urlHelpers';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import moduleStyles from './confirmRemoveStudentDialog.module.scss';

// A stub set of otherwise-required props for use in stories and unit tests.
export const MINIMUM_TEST_PROPS = {
  isOpen: true,
  studentName: 'Clark Kent',
  onConfirm: () => {},
  onCancel: () => {},
};

export default class ConfirmRemoveStudentDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool,
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

  renderBody() {
    const {hasEverSignedIn, dependsOnThisSectionForLogin} = this.props;
    if (!hasEverSignedIn) {
      return null;
    }
    return (
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
          <div className={moduleStyles.removeStudentBody2Container}>
            <p>{i18n.removeStudentBody2()}</p>
            <Link
              size="s"
              href={ADD_A_PERSONAL_LOGIN_HELP_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {i18n.removeStudentSendHomeInstructions()}
            </Link>
          </div>
        )}
      </div>
    );
  }

  render() {
    const {isOpen, disabled, onConfirm, onCancel} = this.props;
    if (!isOpen) {
      return null;
    }

    return (
      <Dialog
        title={this.headerText()}
        customContent={
          <div id="dsco-dialog-description">{this.renderBody()}</div>
        }
        icon={{
          iconName: 'circle-exclamation',
          iconFamily: 'solid',
          style: {display: 'flex'},
        }}
        onClose={onCancel}
        primaryButtonProps={{
          children: i18n.removeStudent(),
          onClick: onConfirm,
          color: 'error',
          disabled: !!disabled,
        }}
        secondaryButtonProps={{
          children: i18n.cancel(),
          onClick: onCancel,
          disabled: !!disabled,
        }}
      />
    );
  }
}
