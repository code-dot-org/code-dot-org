import React from 'react';
import {mount} from 'enzyme';
import i18n from '@cdo/locale';
import {assert} from '../../../util/reconfiguredChai';
import ConfirmRemoveStudentDialog, {
  MINIMUM_TEST_PROPS
} from '@cdo/apps/templates/manageStudents/ConfirmRemoveStudentDialog';
import Button from '@cdo/apps/templates/Button';
import {
  Header,
  ConfirmCancelFooter
} from '@cdo/apps/lib/ui/SystemDialog/SystemDialog';
import {
  ADD_A_PERSONAL_LOGIN_HELP_URL,
  RELEASE_OR_DELETE_RECORDS_EXPLANATION
} from '@cdo/apps/lib/util/urlHelpers';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

const studentName = MINIMUM_TEST_PROPS.studentName;

describe('ConfirmRemoveStudentDialog', () => {
  it('renders nothing if not open', () => {
    const wrapper = mount(
      <ConfirmRemoveStudentDialog {...MINIMUM_TEST_PROPS} isOpen={false} />
    );
    assert.equal('<div></div>', wrapper.html());
  });

  it('renders minimal content if student has never signed in', () => {
    const wrapper = mount(
      <ConfirmRemoveStudentDialog
        {...MINIMUM_TEST_PROPS}
        hasEverSignedIn={false}
      />
    );
    assert(
      wrapper.containsMatchingElement(
        <div>
          <Header text={i18n.removeUnusedStudentHeader({studentName})} />
          <ConfirmCancelFooter
            confirmText={i18n.removeStudent()}
            confirmColor={Button.ButtonColor.red}
            onConfirm={MINIMUM_TEST_PROPS.onConfirm}
            onCancel={MINIMUM_TEST_PROPS.onCancel}
            disableConfirm={false}
            disableCancel={false}
            tabIndex="1"
          />
        </div>
      )
    );
  });

  it('renders warning text if student has ever signed in', () => {
    const wrapper = mount(
      <ConfirmRemoveStudentDialog
        {...MINIMUM_TEST_PROPS}
        hasEverSignedIn={true}
      />
    );
    assert(
      wrapper.containsMatchingElement(
        <div>
          <Header text={i18n.removeStudentAndRecordsHeader({studentName})} />
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
          </div>
          <ConfirmCancelFooter
            confirmText={i18n.removeStudent()}
            confirmColor={Button.ButtonColor.red}
            onConfirm={MINIMUM_TEST_PROPS.onConfirm}
            onCancel={MINIMUM_TEST_PROPS.onCancel}
            disableConfirm={false}
            disableCancel={false}
            tabIndex="1"
          />
        </div>
      )
    );
  });

  it('renders personal login help if student depends on this section for login', () => {
    const wrapper = mount(
      <ConfirmRemoveStudentDialog
        {...MINIMUM_TEST_PROPS}
        hasEverSignedIn={true}
        dependsOnThisSectionForLogin={true}
      />
    );
    assert(
      wrapper.containsMatchingElement(
        <div>
          <Header text={i18n.removeStudentAndRecordsHeader({studentName})} />
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
            <div>
              <p>{i18n.removeStudentBody2()}</p>
              <Button
                __useDeprecatedTag
                text={i18n.removeStudentSendHomeInstructions()}
                target="_blank"
                rel="noopener noreferrer"
                href={ADD_A_PERSONAL_LOGIN_HELP_URL}
                color={Button.ButtonColor.blue}
                size={Button.ButtonSize.large}
                tabIndex="1"
              />
            </div>
          </div>
          <ConfirmCancelFooter
            confirmText={i18n.removeStudent()}
            confirmColor={Button.ButtonColor.red}
            onConfirm={MINIMUM_TEST_PROPS.onConfirm}
            onCancel={MINIMUM_TEST_PROPS.onCancel}
            disableConfirm={false}
            disableCancel={false}
            tabIndex="1"
          />
        </div>
      )
    );
  });
});
