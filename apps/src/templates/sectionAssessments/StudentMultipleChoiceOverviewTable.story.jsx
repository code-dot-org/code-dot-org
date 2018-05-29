import React from 'react';
import StudentMultipleChoiceOverviewTable from './StudentMultipleChoiceOverviewTable';

const studentOverviewData = [
  {
    id: 1,
    name: 'Caley',
    numMultipleChoiceCorrect: 7,
    numMultipleChoice: 10,
    percentCorrect: '70%',
    submissionTimeStamp: '2/16/18 - 7:41 AM',
  },
  {
    id: 2,
    name: 'Maddie',
    numMultipleChoiceCorrect: 3,
    numMultipleChoice: 10,
    percentCorrect: '',
    submissionTimeStamp: 'In Progress',
  },
  {
    id: 3,
    name: 'Erin',
    numMultipleChoiceCorrect: 8,
    numMultipleChoice: 10,
    percentCorrect: '80%',
    submissionTimeStamp: '2/16/18 - 7:41 AM',
  },
  {
    id: 4,
    name: 'Dave',
    numMultipleChoiceCorrect: 10,
    numMultipleChoice: 10,
    percentCorrect: '100%',
    submissionTimeStamp: '2/16/18 - 8:00 AM',
  },
  {
    id: 5,
    name: 'Brad',
    numMultipleChoiceCorrect: 0,
    numMultipleChoice: 10,
    percentCorrect: '',
    submissionTimeStamp: 'Not Started',
  },
];

export default storybook => {
  return storybook
    .storiesOf('SectionAssessments/StudentMultipleChoiceOverviewTable', module)
    .addStoryTable([
      {
        name: 'Student overview',
        description: 'Display assessment summary for each student',
        story: () => (
          <StudentMultipleChoiceOverviewTable
            studentOverviewData={studentOverviewData}
          />
        )
      },
    ]);
};
