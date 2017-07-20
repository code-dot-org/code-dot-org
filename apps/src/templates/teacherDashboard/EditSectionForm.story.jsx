import React from 'react';
import {UnconnectedEditSectionForm} from "./EditSectionForm";

export default storybook => storybook
  .storiesOf('EditSectionForm', module)
  .add('Basic options', () => {
    return (
      <UnconnectedEditSectionForm
        handleSave={storybook.action('handleSave')}
        handleClose={storybook.action('handleClose')}
        handleName={storybook.action('handleName')}
        handleGrade={storybook.action('handleGrade')}
        handleExtras={storybook.action('handleExtras')}
        handlePairing={storybook.action('handlePairing')}
        assignmentRef={() => {}}
        validGrades={['K', '1', '2', '3']}
        validAssignments={{}}
        primaryAssignmentIds={[]}
        sections={{}}
      />
    );
  });
