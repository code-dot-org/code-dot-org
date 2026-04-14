import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import _ from 'lodash';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {UnconnectedAddSectionDialog as AddSectionDialog} from '@cdo/apps/templates/teacherDashboard/AddSectionDialog';
import * as utils from '@cdo/apps/utils';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

jest.mock('@code-dot-org/component-library/dialog', () => {
  const PropTypes = require('prop-types');
  const MockDialog = ({customContent}) => <div>{customContent}</div>;
  MockDialog.propTypes = {
    customContent: PropTypes.node,
  };

  return {
    Dialog: MockDialog,
  };
});

const getDialogBody = wrapper => wrapper.dive();

describe('AddSectionDialog', () => {
  let defaultProps,
    beginImportRosterFlow,
    setRosterProvider,
    setLoginType,
    setParticipantType,
    handleCancel;

  beforeEach(() => {
    beginImportRosterFlow = sinon.spy();
    setRosterProvider = sinon.spy();
    setLoginType = sinon.spy();
    setParticipantType = sinon.spy();
    handleCancel = sinon.spy();
    defaultProps = {
      isOpen: true,
      section: {
        id: 1,
        name: '',
        loginType: null,
        grade: '',
        providerManaged: false,
        lessonExtras: true,
        pairingAllowed: true,
        ttsAutoplayEnabled: false,
        sharingDisabled: false,
        studentCount: 0,
        participantType: null,
        code: '',
        courseId: null,
        courseOfferingId: null,
        courseVersionId: null,
        unitId: null,
        hidden: false,
        restrictSection: false,
      },
      beginImportRosterFlow,
      setRosterProvider,
      setLoginType,
      setParticipantType,
      handleCancel,
      availableParticipantTypes: ['student'],
      asyncLoadComplete: true,
    };
  });

  it('returns null when the dialog is closed', () => {
    const wrapper = shallow(
      <AddSectionDialog {...defaultProps} isOpen={false} />
    );

    expect(wrapper.type()).to.equal(null);
  });

  it('shows loading screen if data isnt fully loaded', () => {
    const wrapper = shallow(
      <AddSectionDialog
        {...defaultProps}
        availableParticipantTypes={['student', 'teacher', 'facilitator']}
        asyncLoadComplete={false}
      />
    );
    const dialogBody = getDialogBody(wrapper);
    expect(dialogBody.find('Spinner').length).to.equal(1);
    expect(dialogBody.find('LoginTypePicker').length).to.equal(0);
    expect(dialogBody.find('ParticipantTypePicker').length).to.equal(0);
  });

  it('if login type is set but audience has not shows audience picker', () => {
    let sectionWithLoginType = _.cloneDeep(defaultProps.section);
    sectionWithLoginType.loginType = 'word';

    const wrapper = shallow(
      <AddSectionDialog
        {...defaultProps}
        section={sectionWithLoginType}
        availableParticipantTypes={['student', 'teacher', 'facilitator']}
      />
    );
    const dialogBody = getDialogBody(wrapper);
    expect(dialogBody.find('Spinner').length).to.equal(0);
    expect(dialogBody.find('LoginTypePicker').length).to.equal(0);
    expect(dialogBody.find('ParticipantTypePicker').length).to.equal(1);
  });

  describe('sectionSetupRefresh', () => {
    let navigateToHrefSpy;

    beforeEach(() => {
      navigateToHrefSpy = sinon.spy(utils, 'navigateToHref');
    });

    afterEach(() => {
      navigateToHrefSpy.restore();
    });

    it('records login type cancel analytics from the dialog button', () => {
      const sendEventStub = sinon.stub(analyticsReporter, 'sendEvent');
      const sectionWithParticipantType = _.cloneDeep(defaultProps.section);
      sectionWithParticipantType.participantType = 'student';
      const wrapper = shallow(
        <AddSectionDialog
          {...defaultProps}
          section={sectionWithParticipantType}
          availableParticipantTypes={['student', 'teacher', 'facilitator']}
        />
      );

      wrapper.prop('primaryButtonProps').onClick();

      expect(sendEventStub).to.be.calledWith('Section Setup Cancelled', {
        source: 'Login Type Selection',
      });
      expect(handleCancel).to.be.called.once;
      sendEventStub.restore();
    });

    it('redirects to new section setup with redirect to MyPL page when selecting non-student participant type', () => {
      const newSection = _.cloneDeep(defaultProps.section);
      const wrapper = shallow(
        <AddSectionDialog
          {...defaultProps}
          section={newSection}
          availableParticipantTypes={['student', 'teacher', 'facilitator']}
        />
      );
      const dialogBody = getDialogBody(wrapper);

      dialogBody.find('ParticipantTypePicker').invoke('setParticipantType')(
        'teacher'
      );
      expect(navigateToHrefSpy).to.be.called.once;
      expect(navigateToHrefSpy.getCall(0).args[0]).to.equal(
        '/sections/new?participantType=teacher&loginType=email&redirectToPage=my-professional-learning'
      );
    });

    it('redirects to new section setup when selecting non-oauth login type', () => {
      const sectionWithParticipantType = _.cloneDeep(defaultProps.section);
      sectionWithParticipantType.participantType = 'student';
      const wrapper = shallow(
        <AddSectionDialog
          {...defaultProps}
          section={sectionWithParticipantType}
          availableParticipantTypes={['student', 'teacher', 'facilitator']}
        />
      );
      const dialogBody = getDialogBody(wrapper);

      dialogBody.find('Connect(LoginTypePicker)').invoke('setLoginType')(
        'word'
      );
      expect(navigateToHrefSpy).to.be.called.once;
      expect(navigateToHrefSpy.getCall(0).args[0]).to.equal(
        '/sections/new?participantType=student&loginType=word'
      );
    });

    it('does not redirect to new section setup when selection oauth login type', () => {
      const sectionWithParticipantType = _.cloneDeep(defaultProps.section);
      sectionWithParticipantType.participantType = 'student';
      const wrapper = shallow(
        <AddSectionDialog
          {...defaultProps}
          section={sectionWithParticipantType}
          availableParticipantTypes={['student', 'teacher', 'facilitator']}
        />
      );
      const dialogBody = getDialogBody(wrapper);

      dialogBody.find('Connect(LoginTypePicker)').invoke('setLoginType')(
        'google_classroom'
      );
      expect(navigateToHrefSpy).to.have.not.been.called;
    });

    it('does not record login type cancel analytics before participant type is chosen', () => {
      const sendEventStub = sinon.stub(analyticsReporter, 'sendEvent');
      const wrapper = shallow(
        <AddSectionDialog
          {...defaultProps}
          availableParticipantTypes={['student', 'teacher', 'facilitator']}
        />
      );

      wrapper.prop('primaryButtonProps').onClick();

      expect(sendEventStub).to.not.have.been.called;
      expect(handleCancel).to.be.called.once;
      sendEventStub.restore();
    });
  });
});
