import React from 'react';
import TextResponsesTable from './TextResponsesTable';

const sectionId = 1;
const responses = [
  {
    puzzle: 2,
    question: 'Check Your Understanding',
    response: 'Lorem ipsum dolor sit amet, postea pericula',
    stage: 'Lesson 1',
    studentId: 1,
    studentName: 'Student A',
    url: 'http://fake.url'
  },
  {
    puzzle: 3,
    question: 'Free Response',
    response: 'Lorem ipsum dolor sit amet, postea pericula',
    stage: 'Lesson 2',
    studentId: 3,
    studentName: 'Student C',
    url: 'http://fake.url'
  },
  {
    puzzle: 1,
    question: 'Free Response',
    response:
      'Lorem ipsum dolor sit amet, postea pericula. Lorem ipsum dolor sit amet, postea pericula. Lorem ipsum dolor sit amet, postea pericula',
    stage: 'Lesson 1',
    studentId: 2,
    studentName: 'Student B',
    url: 'http://fake.url'
  }
];

export default storybook =>
  storybook.storiesOf('TextResponsesTable', module).addStoryTable([
    {
      name: 'Text responses table',
      story: () => (
        <TextResponsesTable
          responses={responses}
          sectionId={sectionId}
          isLoading={false}
        />
      )
    },
    {
      name: 'Empty text responses table',
      description: 'Displays an empty state message',
      story: () => (
        <TextResponsesTable
          responses={[]}
          sectionId={sectionId}
          isLoading={false}
        />
      )
    }
  ]);
