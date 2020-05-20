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
  it('renders LoginTypeField with all login type options when there are no students', () => {
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
        stageExtrasAvailable={() => false}
        hiddenStageState={{}}
        updateHiddenScript={() => {}}
        assignedScriptName="script name"
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 1);
    assert.equal(loginTypeField.find('option').length, 5);
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
    assert.equal(
      loginTypeField
        .find('option')
        .at(2)
        .props().value,
      SectionLoginType.email
    );
    assert.equal(
      loginTypeField
        .find('option')
        .at(3)
        .props().value,
      SectionLoginType.google_classroom
    );
    assert.equal(
      loginTypeField
        .find('option')
        .at(4)
        .props().value,
      SectionLoginType.clever
    );
  });
  it('renders LoginTypeField with email, word and picture options for personal email sections', () => {
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
        stageExtrasAvailable={() => false}
        hiddenStageState={{}}
        updateHiddenScript={() => {}}
        assignedScriptName="script name"
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 1);
    assert.equal(loginTypeField.find('option').length, 3);
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
    assert.equal(
      loginTypeField
        .find('option')
        .at(2)
        .props().value,
      SectionLoginType.email
    );
  });
  it('renders LoginTypeField with word and picture options for word sections', () => {
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
        stageExtrasAvailable={() => false}
        hiddenStageState={{}}
        updateHiddenScript={() => {}}
        assignedScriptName="script name"
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
  it('renders LoginTypeField with word and picture options for picture sections', () => {
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
        stageExtrasAvailable={() => false}
        hiddenStageState={{}}
        updateHiddenScript={() => {}}
        assignedScriptName="script name"
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
  it('does not render LoginTypeField for Google Classroom sections', () => {
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
        stageExtrasAvailable={() => false}
        hiddenStageState={{}}
        updateHiddenScript={() => {}}
        assignedScriptName="script name"
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 0);
  });
  it('does not render LoginTypeField for Clever sections', () => {
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
        stageExtrasAvailable={() => false}
        hiddenStageState={{}}
        updateHiddenScript={() => {}}
        assignedScriptName="script name"
      />
    );
    const loginTypeField = wrapper.find('LoginTypeField');
    assert.equal(loginTypeField.length, 0);
  });
});
