import React from 'react';
import TextResponsesTable from './TextResponsesTable';

export default {
  title: 'TextResponsesTable',
  component: TextResponsesTable,
};

const sectionId = 1;
const responses = [
  {
    puzzle: 2,
    question: 'Check Your Understanding',
    response: 'Lorem ipsum dolor sit amet, postea pericula',
    lesson: 'Lesson 1',
    studentId: 1,
    studentName: 'Student A',
    url: 'http://fake.url',
  },
  {
    puzzle: 3,
    question: 'Free Response',
    response: 'Lorem ipsum dolor sit amet, postea pericula',
    lesson: 'Lesson 2',
    studentId: 3,
    studentName: 'Student C',
    url: 'http://fake.url',
  },
  {
    puzzle: 1,
    question: 'Free Response',
    response:
      'Lorem ipsum dolor sit amet, postea pericula. Lorem ipsum dolor sit amet, postea pericula. Lorem ipsum dolor sit amet, postea pericula',
    lesson: 'Lesson 1',
    studentId: 2,
    studentName: 'Student B',
    url: 'http://fake.url',
  },
];

const Template = args => (
  <TextResponsesTable sectionId={sectionId} isLoading={false} {...args} />
);

export const WithResponses = Template.bind({});
WithResponses.args = {
  responses: responses,
};

export const WithoutResponses = Template.bind({});
WithoutResponses.args = {
  responses: [],
};
