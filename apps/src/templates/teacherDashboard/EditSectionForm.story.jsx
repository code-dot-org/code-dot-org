import React from 'react';
import {UnconnectedEditSectionForm as EditSectionForm} from "./EditSectionForm";

const testSection = {
  id: 11,
  courseId: 29,
  scriptId: null,
  name: "my_section",
  loginType: "word",
  grade: "3",
  providerManaged: false,
  stageExtras: false,
  pairingAllowed: true,
  studentCount: 10,
  code: "PMTKVH",
};

export default storybook => storybook
  .storiesOf('EditSectionForm', module)
  .add('Basic options', () => {
    return (
      <EditSectionForm
        title="Edit section details"
        handleSave={storybook.action('handleSave')}
        handleClose={storybook.action('handleClose')}
        editSectionProperties={storybook.action('editSectionProperties')}
        validGrades={['K', '1', '2', '3']}
        validAssignments={{}}
        primaryAssignmentIds={[]}
        sections={{}}
        section={testSection}
      />
    );
  });
