import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {
  Header,
  ConfirmCancelFooter,
} from '@cdo/apps/lib/ui/SystemDialog/SystemDialog';
import {
  ADD_A_PERSONAL_LOGIN_HELP_URL,
  RELEASE_OR_DELETE_RECORDS_EXPLANATION,
} from '@cdo/apps/lib/util/urlHelpers';
import Button from '@cdo/apps/templates/Button';
import ConfirmRemoveStudentDialog, {
  MINIMUM_TEST_PROPS,
} from '@cdo/apps/templates/manageStudents/ConfirmRemoveStudentDialog';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

const studentName = MINIMUM_TEST_PROPS.studentName;

describe('ConfirmRemoveStudentDialog', () => {
  it('renders nothing if not open', () => {
    const wrapper = mount(
      <ConfirmRemoveStudentDialog {...MINIMUM_TEST_PROPS} isOpen={false} />
    );
    expect('<div></div>').toEqual(wrapper.html());
  });

  it('renders minimal content if student has never signed in', () => {
    const wrapper = mount(
      <ConfirmRemoveStudentDialog
        {...MINIMUM_TEST_PROPS}
        hasEverSignedIn={false}
      />
    );
    expect(
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
    ).toBeTruthy();
  });

  it('renders warning text if student has ever signed in', () => {
    const wrapper = mount(
      <ConfirmRemoveStudentDialog
        {...MINIMUM_TEST_PROPS}
        hasEverSignedIn={true}
      />
    );
    expect(
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
    ).toBeTruthy();
  });

  it('renders personal login help if student depends on this section for login', () => {
    const wrapper = mount(
      <ConfirmRemoveStudentDialog
        {...MINIMUM_TEST_PROPS}
        hasEverSignedIn={true}
        dependsOnThisSectionForLogin={true}
      />
    );
    expect(
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
    ).toBeTruthy();
  });
});
