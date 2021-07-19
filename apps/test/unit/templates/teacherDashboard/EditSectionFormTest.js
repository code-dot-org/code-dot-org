import React from 'react';
import {mount} from 'enzyme';
import {assert} from '../../../util/reconfiguredChai';
import {UnconnectedEditSectionForm as EditSectionForm} from '@cdo/apps/templates/teacherDashboard/EditSectionForm';
import {
  assignmentFamilies,
  validAssignments,
  testSection,
  noStudentsSection
} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';

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
});
