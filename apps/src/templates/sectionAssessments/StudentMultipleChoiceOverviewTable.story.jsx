import React from 'react';
import StudentMultipleChoiceOverviewTable from './StudentMultipleChoiceOverviewTable';

const studentOverviewData = [
  {
    id: 1,
    studentId: '210',
    name: 'Caley',
    numMultipleChoiceCorrect: 7,
    totalMultipleChoice: 10,
    percentCorrect: '70%',
    submissionTimeStamp: '2/16/18 - 7:41 AM',
  },
  {
    id: 2,
    studentId: '211',
    name: 'Maddie',
    numMultipleChoiceCorrect: 3,
    totalMultipleChoice: 10,
    percentCorrect: '',
    submissionTimeStamp: 'In Progress',
  },
  {
    id: 3,
    studentId: '212',
    name: 'Erin',
    numMultipleChoiceCorrect: 8,
    totalMultipleChoice: 10,
    percentCorrect: '80%',
    submissionTimeStamp: '2/16/18 - 7:41 AM',
  },
  {
    id: 4,
    studentId: '213',
    name: 'Dave',
    numMultipleChoiceCorrect: 10,
    totalMultipleChoice: 10,
    percentCorrect: '100%',
    submissionTimeStamp: '2/16/18 - 8:00 AM',
  },
  {
    id: 5,
    studentId: '214',
    name: 'Brad',
    numMultipleChoiceCorrect: 0,
    totalMultipleChoice: 10,
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
