import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedAddSectionDialog as AddSectionDialog} from '@cdo/apps/templates/teacherDashboard/AddSectionDialog';
import _ from 'lodash';

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
        restrictSection: false
      },
      beginImportRosterFlow,
      setRosterProvider,
      setLoginType,
      setParticipantType,
      handleCancel,
      availableParticipantTypes: ['student'],
      asyncLoadComplete: true
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
    expect(wrapper.find('Connect(EditSectionForm)').length).to.equal(0);
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
    expect(wrapper.find('Connect(EditSectionForm)').length).to.equal(0);
  });

  it('once login type and audience are set EditSectionForm shows', () => {
    let sectionWithLoginAndParticipantType = _.cloneDeep(defaultProps.section);
    sectionWithLoginAndParticipantType.loginType = 'word';
    sectionWithLoginAndParticipantType.participantType = 'student';

    const wrapper = shallow(
      <AddSectionDialog
        {...defaultProps}
        section={sectionWithLoginAndParticipantType}
      />
    );
    expect(wrapper.find('Spinner').length).to.equal(0);
    expect(wrapper.find('LoginTypePicker').length).to.equal(0);
    expect(wrapper.find('ParticipantTypePicker').length).to.equal(0);
    expect(wrapper.find('Connect(EditSectionForm)').length).to.equal(1);
  });
});
