import React from 'react';
import StageDescriptions from './StageDescriptions';

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '4px 6px',
  color: '#555',
  border: '1px solid #ccc',
  borderRadius: 4
};

const currentByStage = {
  'The Internet': {
    studentDescription: 'This is what the student will see',
    teacherDescription: 'This is what the teacher will see'
  },
  'The Need for Addressing': {
    studentDescription: 'This is what the student will see',
    teacherDescription: 'This is what the teacher will see'
  }
};

const importedByStage={
  'The Internet': {
    studentDescription: 'This is the new description of what the student will see',
    teacherDescription: 'This is the new description of what the teacher will see'
  },
  'The Need for Addressing': {
    studentDescription: 'This is the new description of what the student will see',
    teacherDescription: 'This is the new description of what the teacher will see'
  }
};

export default storybook => {
  storybook
    .storiesOf('StageDescriptions', module)
    .addStoryTable([
      {
        name:'stage descriptions',
        story: () => (
          <StageDescriptions
            isImporting={false}
            inputStyle={inputStyle}
            currentByStage={currentByStage}
            importedByStage={{}}
          />
        )
      },
      {
        name:'While merging',
        story: () => (
          <StageDescriptions
            isImporting={true}
            inputStyle={inputStyle}
            currentByStage={currentByStage}
            importedByStage={{}}
          />
        )
      },
      {
        name:'stage descriptions with changes after merging',
        story: () => (
          <StageDescriptions
            isImporting={false}
            inputStyle={inputStyle}
            currentByStage={currentByStage}
            importedByStage={importedByStage}
          />
        )
      }
    ]);
};
