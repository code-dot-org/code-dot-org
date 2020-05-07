import React from 'react';
import {UnconnectedEditSectionForm as EditSectionForm} from './EditSectionForm';
import {action} from '@storybook/addon-actions';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import {
  assignmentFamilies,
  validAssignments,
  testSection
} from './teacherDashboardTestHelpers';

const testSection = {
  id: 11,
  courseId: 29,
  scriptId: null,
  name: 'my_section',
  loginType: 'word',
  grade: '3',
  providerManaged: false,
  stageExtras: false,
  pairingAllowed: true,
  autoplayEnabled: false,
  studentCount: 10,
  code: 'PMTKVH'
};
        
export default storybook => {
  storybook = storybook.storiesOf('EditSectionForm', module);

  Object.values(SectionLoginType).forEach(loginType => {
    storybook = storybook.add(`Generic / ${loginType}`, () => (
      <EditSectionForm
        title="Edit section details"
        handleSave={action('handleSave')}
        handleClose={action('handleClose')}
        editSectionProperties={action('editSectionProperties')}
        validGrades={['K', '1', '2', '3']}
        validAssignments={validAssignments}
        assignmentFamilies={assignmentFamilies}
        sections={{}}
        section={{
          ...testSection,
          loginType: loginType
        }}
        isSaveInProgress={false}
        stageExtrasAvailable={() => false}
        hiddenStageState={{}}
        updateHiddenScript={() => {}}
        assignedScriptName="script name"
      />
    ));
    storybook = storybook.add('no students yet', () => (
      <EditSectionForm
        title="Edit section details"
        handleSave={action('handleSave')}
        handleClose={action('handleClose')}
        editSectionProperties={action('editSectionProperties')}
        validGrades={['K', '1', '2', '3']}
        validAssignments={validAssignments}
        assignmentFamilies={assignmentFamilies}
        sections={{}}
        section={{
          ...testSection,
          studentCount: 0
        }}
        isSaveInProgress={false}
        stageExtrasAvailable={() => false}
        hiddenStageState={{}}
        updateHiddenScript={() => {}}
        assignedScriptName="script name"
      />
    ));
    storybook = storybook.add('save in progress', () => (
      <EditSectionForm
        title="Edit section details"
        handleSave={action('handleSave')}
        handleClose={action('handleClose')}
        editSectionProperties={action('editSectionProperties')}
        validGrades={['K', '1', '2', '3']}
        validAssignments={validAssignments}
        assignmentFamilies={assignmentFamilies}
        sections={{}}
        section={testSection}
        isSaveInProgress={true}
        stageExtrasAvailable={() => false}
        hiddenStageState={{}}
        updateHiddenScript={() => {}}
        assignedScriptName="script name"
      />
    ));
  });
};
