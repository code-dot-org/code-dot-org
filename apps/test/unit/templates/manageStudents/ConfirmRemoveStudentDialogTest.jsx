import React from 'react';
import {mount} from 'enzyme';
import i18n from '@cdo/locale';
import {expect} from '../../../util/configuredChai';
import ConfirmRemoveStudentDialog, {MINIMUM_TEST_PROPS} from '@cdo/apps/templates/manageStudents/ConfirmRemoveStudentDialog';
import Button from '@cdo/apps/templates/Button';
import {Header, ConfirmCancelFooter} from '@cdo/apps/lib/ui/SystemDialog/SystemDialog';
import {ADD_A_PERSONAL_LOGIN_HELP_URL, RELEASE_OR_DELETE_RECORDS_EXPLANATION} from '@cdo/apps/lib/util/urlHelpers';

const studentName = MINIMUM_TEST_PROPS.studentName;

describe('ConfirmRemoveStudentDialog', () => {
  it('renders nothing if not open', () => {
    const wrapper = mount(
      <ConfirmRemoveStudentDialog
        {...MINIMUM_TEST_PROPS}
        isOpen={false}
      />
    );
    expect(wrapper).to.be.empty;
  });

  it('renders minimal content if student has never signed in', () => {
    const wrapper = mount(
      <ConfirmRemoveStudentDialog
        {...MINIMUM_TEST_PROPS}
        hasEverSignedIn={false}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <Header text={i18n.removeUnusedStudentHeader({studentName})}/>
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
    );
  });

  it('renders warning text if student has ever signed in', () => {
    const wrapper = mount(
      <ConfirmRemoveStudentDialog
        {...MINIMUM_TEST_PROPS}
        hasEverSignedIn={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <Header text={i18n.removeStudentAndRecordsHeader({studentName})}/>
        <div>
          <p>
            <strong>{i18n.removeStudentBody1()}</strong>
            {' '}
            {i18n.removeStudentBody2()}
            {' '}
            <a href={RELEASE_OR_DELETE_RECORDS_EXPLANATION} target="_blank">
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
    expect(wrapper).to.containMatchingElement(
      <div>
        <Header text={i18n.removeStudentAndRecordsHeader({studentName})}/>
        <div>
          <p>
            <strong>{i18n.removeStudentBody1()}</strong>
            {' '}
            {i18n.removeStudentBody2()}
            {' '}
            <a href={RELEASE_OR_DELETE_RECORDS_EXPLANATION} target="_blank">
              {i18n.learnMore()}
            </a>
          </p>
          <div>
            <p>
              {i18n.removeStudentBody3()}
            </p>
            <Button
              text={i18n.removeStudentSendHomeInstructions()}
              target="_blank"
              href={ADD_A_PERSONAL_LOGIN_HELP_URL}
              color={Button.ButtonColor.blue}
              size={Button.ButtonSize.large}
              tabIndex="1"
            />
            <p>
              {i18n.removeStudentBody4()}
            </p>
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
    );
  });
});
