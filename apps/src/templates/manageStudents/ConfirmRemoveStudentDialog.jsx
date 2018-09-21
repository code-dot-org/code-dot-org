import _ from 'lodash';
import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';
import {Header, ConfirmCancelFooter} from '../../lib/ui/SystemDialog/SystemDialog';
import BaseDialog from '../BaseDialog';
import Button from "../Button";
import color from "../../util/color";
import {ADD_A_PERSONAL_LOGIN_HELP_URL, RELEASE_OR_DELETE_RECORDS_EXPLANATION} from "@cdo/apps/lib/util/urlHelpers";
import UnsafeRenderedMarkdown from '@cdo/apps/templates/UnsafeRenderedMarkdown';

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
    return hasEverSignedIn ?
      i18n.removeStudentAndRecordsHeader({studentName}) :
      i18n.removeUnusedStudentHeader({studentName});
  }

  render() {
    const {disabled, hasEverSignedIn, dependsOnThisSectionForLogin, onConfirm,
      onCancel} = this.props;
    return (
      <BaseDialog
        {...(_.pick(this.props, propsFromBaseDialog))}
        useUpdatedStyles
        handleClose={onCancel}
      >
        <div style={styles.container}>
          <Header
            text={this.headerText()}
            hideBorder={!hasEverSignedIn}
          />
          {hasEverSignedIn &&
            <div>
              <p>
                <UnsafeRenderedMarkdown
                  markdown={i18n.removeStudentBody1({
                    explanationUrl: RELEASE_OR_DELETE_RECORDS_EXPLANATION})}
                />
              </p>
              {dependsOnThisSectionForLogin &&
                <div>
                  <p>
                    {i18n.removeStudentBody2()}
                  </p>
                  <Button
                    text={i18n.removeStudentSendHomeInstructions()}
                    target="_blank"
                    href={ADD_A_PERSONAL_LOGIN_HELP_URL}
                    color={Button.ButtonColor.blue}
                    size={Button.ButtonSize.large}
                    style={styles.sendHomeInstructionsButton}
                    tabIndex="1"
                  />
                  <p>
                    {i18n.removeStudentBody3()}
                  </p>
                </div>
              }
            </div>
          }
          <ConfirmCancelFooter
            confirmText={i18n.removeStudent()}
            confirmColor={Button.ButtonColor.red}
            onConfirm={onConfirm}
            onCancel={onCancel}
            disableConfirm={!!disabled}
            disableCancel={!!disabled}
            tabIndex="1"
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
  }
};
