import React from 'react';
import {shallow, mount} from 'enzyme';
import {assert, expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import {UnconnectedEditSectionForm as EditSectionForm} from '@cdo/apps/templates/teacherDashboard/EditSectionForm';
import {
  assignmentFamilies,
  validAssignments,
  testSection,
  noStudentsSection
} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import experiments from '@cdo/apps/util/experiments';

describe('EditSectionForm', () => {
  it('renders LoginTypeField with word and picture options for word sections with students', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        validGrades={['K', '1', '2', '3']}
        validAssignments={validAssignments}
        assignmentFamilies={assignmentFamilies}
        sections={{}}
        section={testSection}
        isSaveInProgress={false}
        textToSpeechUnitIds={[]}
        lessonExtrasAvailable={() => false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 1);
    assert.equal(loginTypeField.find('option').length, 2);
    assert.equal(
      loginTypeField
        .find('option')
        .at(0)
        .props().value,
      SectionLoginType.word
    );
    assert.equal(
      loginTypeField
        .find('option')
        .at(1)
        .props().value,
      SectionLoginType.picture
    );
  });
  it('renders LoginTypeField with word and picture options for word sections without students', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        validGrades={['K', '1', '2', '3']}
        validAssignments={validAssignments}
        assignmentFamilies={assignmentFamilies}
        sections={{}}
        section={noStudentsSection}
        isSaveInProgress={false}
        textToSpeechUnitIds={[]}
        lessonExtrasAvailable={() => false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 1);
    assert.equal(loginTypeField.find('option').length, 2);
    assert.equal(
      loginTypeField
        .find('option')
        .at(0)
        .props().value,
      SectionLoginType.word
    );
    assert.equal(
      loginTypeField
        .find('option')
        .at(1)
        .props().value,
      SectionLoginType.picture
    );
  });
  it('renders LoginTypeField with word and picture options for picture sections with students', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        validGrades={['K', '1', '2', '3']}
        validAssignments={validAssignments}
        assignmentFamilies={assignmentFamilies}
        sections={{}}
        section={{...testSection, loginType: SectionLoginType.picture}}
        isSaveInProgress={false}
        textToSpeechUnitIds={[]}
        lessonExtrasAvailable={() => false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 1);
    assert.equal(loginTypeField.find('option').length, 2);
    assert.equal(
      loginTypeField
        .find('option')
        .at(0)
        .props().value,
      SectionLoginType.word
    );
    assert.equal(
      loginTypeField
        .find('option')
        .at(1)
        .props().value,
      SectionLoginType.picture
    );
  });
  it('renders LoginTypeField with word and picture options for picture sections without students', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        validGrades={['K', '1', '2', '3']}
        validAssignments={validAssignments}
        assignmentFamilies={assignmentFamilies}
        sections={{}}
        section={{...noStudentsSection, loginType: SectionLoginType.picture}}
        isSaveInProgress={false}
        textToSpeechUnitIds={[]}
        lessonExtrasAvailable={() => false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 1);
    assert.equal(loginTypeField.find('option').length, 2);
    assert.equal(
      loginTypeField
        .find('option')
        .at(0)
        .props().value,
      SectionLoginType.word
    );
    assert.equal(
      loginTypeField
        .find('option')
        .at(1)
        .props().value,
      SectionLoginType.picture
    );
  });
  it('does not render LoginTypeField for personal email sections with students', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        validGrades={['K', '1', '2', '3']}
        validAssignments={validAssignments}
        assignmentFamilies={assignmentFamilies}
        sections={{}}
        section={{
          ...testSection,
          loginType: SectionLoginType.email
        }}
        isSaveInProgress={false}
        textToSpeechUnitIds={[]}
        lessonExtrasAvailable={() => false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 0);
  });
  it('does not render LoginTypeField for personal email sections without students', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        validGrades={['K', '1', '2', '3']}
        validAssignments={validAssignments}
        assignmentFamilies={assignmentFamilies}
        sections={{}}
        section={{
          ...noStudentsSection,
          loginType: SectionLoginType.email
        }}
        isSaveInProgress={false}
        textToSpeechUnitIds={[]}
        lessonExtrasAvailable={() => false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 0);
  });
  it('does not render LoginTypeField for Google Classroom sections with students', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        validGrades={['K', '1', '2', '3']}
        validAssignments={validAssignments}
        assignmentFamilies={assignmentFamilies}
        sections={{}}
        section={{...testSection, loginType: SectionLoginType.google_classroom}}
        isSaveInProgress={false}
        textToSpeechUnitIds={[]}
        lessonExtrasAvailable={() => false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 0);
  });
  it('does not render LoginTypeField for Google Classroom sections without students', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        validGrades={['K', '1', '2', '3']}
        validAssignments={validAssignments}
        assignmentFamilies={assignmentFamilies}
        sections={{}}
        section={{
          ...noStudentsSection,
          loginType: SectionLoginType.google_classroom
        }}
        isSaveInProgress={false}
        textToSpeechUnitIds={[]}
        lessonExtrasAvailable={() => false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 0);
  });
  it('does not render LoginTypeField for Clever sections with students', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        validGrades={['K', '1', '2', '3']}
        validAssignments={validAssignments}
        assignmentFamilies={assignmentFamilies}
        sections={{}}
        section={{...testSection, loginType: SectionLoginType.clever}}
        isSaveInProgress={false}
        textToSpeechUnitIds={[]}
        lessonExtrasAvailable={() => false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 0);
  });
  it('does not render LoginTypeField for Clever sections without students', () => {
    const wrapper = mount(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        validGrades={['K', '1', '2', '3']}
        validAssignments={validAssignments}
        assignmentFamilies={assignmentFamilies}
        sections={{}}
        section={{...noStudentsSection, loginType: SectionLoginType.clever}}
        isSaveInProgress={false}
        textToSpeechUnitIds={[]}
        lessonExtrasAvailable={() => false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 0);
  });

  it('renders CodeReviewField for csa-pilot teacher', () => {
    const experimentStub = sinon.stub(experiments, 'isEnabled');
    experimentStub.withArgs('csa-pilot').returns(true);
    const wrapper = shallow(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        validGrades={['K', '1', '2', '3']}
        validAssignments={validAssignments}
        assignmentFamilies={assignmentFamilies}
        sections={{}}
        section={{...noStudentsSection, loginType: SectionLoginType.clever}}
        isSaveInProgress={false}
        textToSpeechUnitIds={[]}
        lessonExtrasAvailable={() => false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
      />
    );
    expect(wrapper.find('CodeReviewField').length).to.equal(1);
    experimentStub.restore();
  });

  it('renders CodeReviewField for csa-pilot-facilitator teacher', () => {
    const experimentStub = sinon.stub(experiments, 'isEnabled');
    experimentStub.withArgs('csa-pilot').returns(false);
    experimentStub.withArgs('csa-pilot-facilitators').returns(true);
    const wrapper = shallow(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        validGrades={['K', '1', '2', '3']}
        validAssignments={validAssignments}
        assignmentFamilies={assignmentFamilies}
        sections={{}}
        section={{...noStudentsSection, loginType: SectionLoginType.clever}}
        isSaveInProgress={false}
        textToSpeechUnitIds={[]}
        lessonExtrasAvailable={() => false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
      />
    );
    expect(wrapper.find('CodeReviewField').length).to.equal(1);
    experimentStub.restore();
  });

  it('does not render CodeReviewField for non-csa-pilot teacher', () => {
    const experimentStub = sinon.stub(experiments, 'isEnabled');
    experimentStub.withArgs('csa-pilot').returns(false);
    experimentStub.withArgs('csa-pilot-facilitators').returns(false);
    const wrapper = shallow(
      <EditSectionForm
        title="Edit section details"
        handleSave={() => {}}
        handleClose={() => {}}
        editSectionProperties={() => {}}
        validGrades={['K', '1', '2', '3']}
        validAssignments={validAssignments}
        assignmentFamilies={assignmentFamilies}
        sections={{}}
        section={{...noStudentsSection, loginType: SectionLoginType.clever}}
        isSaveInProgress={false}
        textToSpeechUnitIds={[]}
        lessonExtrasAvailable={() => false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
      />
    );
    expect(wrapper.find('CodeReviewField').length).to.equal(0);
    experimentStub.restore();
  });
});
