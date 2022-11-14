import React from 'react';
import TextResponsesTable from './TextResponsesTable';

export default {
  title: 'TextResponsesTable',
  component: TextResponsesTable
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
    url: 'http://fake.url'
  },
  {
    puzzle: 3,
    question: 'Free Response',
    response: 'Lorem ipsum dolor sit amet, postea pericula',
    lesson: 'Lesson 2',
    studentId: 3,
    studentName: 'Student C',
    url: 'http://fake.url'
  },
  {
    puzzle: 1,
    question: 'Free Response',
    response:
      'Lorem ipsum dolor sit amet, postea pericula. Lorem ipsum dolor sit amet, postea pericula. Lorem ipsum dolor sit amet, postea pericula',
    lesson: 'Lesson 1',
    studentId: 2,
    studentName: 'Student B',
    url: 'http://fake.url'
  }
];

const Template = args => <TextResponsesTable {...args} />;

export const TextResponsesTableWithResponses = Template.bind({});
TextResponsesTableWithResponses.args = {
  responses: responses,
  sectionId: sectionId,
  isLoading: false
};

export const TextResponsesTableWithoutResponses = Template.bind({});
TextResponsesTableWithoutResponses.args = {
  responses: [],
  sectionId: sectionId,
  isLoading: false
};
