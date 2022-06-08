import React from 'react';
import {UnconnectedEditSectionForm as EditSectionForm} from './EditSectionForm';
import {action} from '@storybook/addon-actions';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import {testSection, courseOfferings} from './teacherDashboardTestHelpers';

export default storybook => {
  storybook = storybook.storiesOf('EditSectionForm', module);

  Object.values(SectionLoginType).forEach(loginType => {
    storybook = storybook.add(`Generic / ${loginType}`, () => (
      <EditSectionForm
        title="Edit section details"
        handleSave={action('handleSave')}
        handleClose={action('handleClose')}
        editSectionProperties={action('editSectionProperties')}
        courseOfferings={courseOfferings}
        sections={{}}
        section={{
          ...testSection,
          loginType: loginType,
          participantType: 'student'
        }}
        isSaveInProgress={false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
        assignedUnitLessonExtrasAvailable={false}
        assignedUnitTextToSpeechEnabled={false}
      />
    ));
    storybook = storybook.add(`no students yet/ ${loginType}`, () => (
      <EditSectionForm
        title="Edit section details"
        handleSave={action('handleSave')}
        handleClose={action('handleClose')}
        editSectionProperties={action('editSectionProperties')}
        courseOfferings={courseOfferings}
        sections={{}}
        section={{
          ...testSection,
          studentCount: 0,
          participantType: 'student'
        }}
        isSaveInProgress={false}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
        assignedUnitLessonExtrasAvailable={false}
        assignedUnitTextToSpeechEnabled={false}
      />
    ));
    storybook = storybook.add(`save in progress/ ${loginType}`, () => (
      <EditSectionForm
        title="Edit section details"
        handleSave={action('handleSave')}
        handleClose={action('handleClose')}
        editSectionProperties={action('editSectionProperties')}
        courseOfferings={courseOfferings}
        sections={{}}
        section={{
          ...testSection,
          participantType: 'student'
        }}
        isSaveInProgress={true}
        hiddenLessonState={{}}
        updateHiddenScript={() => {}}
        assignedUnitName="script name"
        assignedUnitLessonExtrasAvailable={false}
        assignedUnitTextToSpeechEnabled={false}
      />
    ));
  });
};
