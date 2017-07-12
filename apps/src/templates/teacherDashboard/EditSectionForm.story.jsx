import React from 'react';
import EditSectionForm from "./EditSectionForm";

export default storybook => storybook
  .storiesOf('EditSectionForm', module)
  .add('Basic options', () => {
    return (
      <EditSectionForm
        handleSave={() => {}}
      />
    );
  });
