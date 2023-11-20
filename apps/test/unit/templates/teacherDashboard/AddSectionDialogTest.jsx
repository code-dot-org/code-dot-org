import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedAddSectionDialog as AddSectionDialog} from '@cdo/apps/templates/teacherDashboard/AddSectionDialog';
import _ from 'lodash';
import * as utils from '@cdo/apps/utils';

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
      isOpen: false,
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
        isAssigned: undefined,
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

  it('shows loading screen if data isnt fully loaded', () => {
    const wrapper = shallow(
      <AddSectionDialog
        {...defaultProps}
        availableParticipantTypes={['student', 'teacher', 'facilitator']}
        asyncLoadComplete={false}
      />
    );
    expect(wrapper.find('Spinner').length).to.equal(1);
    expect(wrapper.find('LoginTypePicker').length).to.equal(0);
    expect(wrapper.find('ParticipantTypePicker').length).to.equal(0);
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
    expect(wrapper.find('Spinner').length).to.equal(0);
    expect(wrapper.find('LoginTypePicker').length).to.equal(0);
    expect(wrapper.find('ParticipantTypePicker').length).to.equal(1);
  });

  describe('sectionSetupRefresh', () => {
    let navigateToHrefSpy;

    beforeEach(() => {
      navigateToHrefSpy = sinon.spy(utils, 'navigateToHref');
    });

    afterEach(() => {
      navigateToHrefSpy.restore();
    });

    it('redirects to new section setup when selecting non-student participant type', () => {
      const newSection = _.cloneDeep(defaultProps.section);
      const wrapper = shallow(
        <AddSectionDialog
          {...defaultProps}
          section={newSection}
          availableParticipantTypes={['student', 'teacher', 'facilitator']}
        />
      );

      wrapper.find('ParticipantTypePicker').invoke('setParticipantType')(
        'teacher'
      );
      expect(navigateToHrefSpy).to.be.called.once;
      expect(navigateToHrefSpy.getCall(0).args[0]).to.equal(
        '/sections/new?participantType=teacher&loginType=email'
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

      wrapper.find('Connect(LoginTypePicker)').invoke('setLoginType')('word');
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

      wrapper.find('Connect(LoginTypePicker)').invoke('setLoginType')(
        'google_classroom'
      );
      expect(navigateToHrefSpy).to.have.not.been.called;
    });
  });
});
